---
title: Dubbo-SPI解析
date: 2023-03-31 13:40:43
category:
  - java
tag:
  - dubbo系列
---

# Dubbo SPI 解析（Java SPI解析）（上）

## SPI是什么

SPI全称Service Provider Interface，是Java提供的一套用来被第三方实现或者扩展的API，它可以用来启用框架扩展和替换组件。

![image-20230331142758791](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230331142758791.png)

Java SPI 实际上是“**基于接口的编程＋策略模式＋配置文件**”组合实现的动态加载机制。

系统设计的各个抽象，往往有很多不同的实现方案，在面向的对象的设计里，一般推荐模块之间基于接口编程，模块之间不对实现类进行硬编码。一旦代码里涉及具体的实现类，就违反了可拔插的原则，如果需要替换一种实现，就需要修改代码。为了实现在模块装配的时候能不在程序里动态指明，这就需要一种服务发现机制。
 Java SPI就是提供这样的一个机制：为某个接口寻找服务实现的机制。有点类似IOC的思想，就是将装配的控制权移到程序之外，在模块化设计中这个机制尤其重要。所以SPI的核心思想就是**解耦**。

## 使用场景

适用于：**调用者根据实际使用需要，启用、扩展、或者替换框架的实现策略**

* 数据库驱动JDBC加载不同类型数据库驱动
* SL4J 加载不同日志实现

## 使用方式

* 服务的提供者提供了一种接口的实现
* 在 Classpath 下的` META-INF/services/` 目录里创建一个以服务接口命名的文件，此文件记录了该 jar 包提供的服务接口的具体实现类
* 引入服务的应用通过`java.util.ServiceLoder`动态装载实现模块，它通过扫描`META-INF/services`目录下的配置文件找到实现类的全限定名，把类加载到JVM
* SPI的实现类必须携带一个不带参数的构造方法；

下面我们通过一个简单的示例演示下 JDK SPI 的基本使用方式：

![image-20230331142950553](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230331142950553.png)

首先我们需要创建一个 Log 接口，来模拟日志打印的功能：

```java
public interface MyLog {
    void log(String msg);
}
```

接下来提供两个实现—— Logback 和 Log4j，分别代表两个不同日志框架的实现，如下所示：

```java
public class MyLog4j implements MyLog {
    @Override
    public void log(String msg) {
        System.out.println("log4j: " + msg);
    }
}

public class MyLogBack implements MyLog {
    @Override
    public void log(String msg) {
        System.out.println("logback: " + msg);
    }
}
```

在项目的 resources/META-INF/services 目录下添加一个名为` com.matt.MyLog` 的文件，这是 JDK SPI 需要读取的配置文件，具体内容如下：

```
com.matt.impl.MyLog4j
com.matt.impl.MyLogBack
```

![image-20230331143206507](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230331143206507.png)

最后创建 main() 方法，其中会加载上述配置文件，创建全部 MyLog 接口实现的实例，并执行其 log() 方法，如下所示：

```java
public class Main {
    public static void main(String[] args) {
        ServiceLoader<MyLog> serviceLoader = ServiceLoader.load(MyLog.class);
        for (MyLog log:serviceLoader) {
            log.log("hello world");
        }
    }
}

执行结果：
log4j: hello world
logback: hello world

Process finished with exit code 0
```

## 原理解析

通过上述示例，我们可以看到 JDK SPI 的入口方法是 ServiceLoader.load() 方法，接下来我们就对其具体实现进行深入分析。

![image](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/Ciqc1F8o_V6AR93jAABeDIu_Kso211.png)

在 reload() 方法中，首先会清理 providers 缓存（LinkedHashMap 类型的集合），该缓存用来记录 ServiceLoader 创建的实现对象，其中 Key 为实现类的完整类名，Value 为实现类的对象。之后创建 LazyIterator 迭代器，用于读取 SPI 配置文件并实例化实现类对象。

ServiceLoader.reload() 方法的实现：

```java
// 缓存，用来缓存 ServiceLoader创建的实现对象 
private LinkedHashMap<String,S> providers = new LinkedHashMap<>(); 
public void reload() {
        providers.clear();
        lookupIterator = new LazyIterator(service, loader);
}	
```

在前面的示例中，main() 方法中使用的迭代器底层就是调用了 `ServiceLoader.LazyIterator` 实现的。Iterator 接口有两个关键方法：`hasNext() `方法和 `next() `方法。这里的 LazyIterator 中的next() 方法最终调用的是其 nextService() 方法，hasNext() 方法最终调用的是 `hasNextService() `方法，调用关系如下图所示：

```java
private LazyIterator(Class<S> service, ClassLoader loader) {
            this.service = service;
            this.loader = loader;
}
public boolean hasNext() {
    if (acc == null) {
        return hasNextService();
    } else {
        PrivilegedAction<Boolean> action = new PrivilegedAction<Boolean>() {
            public Boolean run() { return hasNextService(); }
        };
        return AccessController.doPrivileged(action, acc);
    }
}

public S next() {
    if (acc == null) {
        return nextService();
    } else {
        PrivilegedAction<S> action = new PrivilegedAction<S>() {
            public S run() { return nextService(); }
        };
        return AccessController.doPrivileged(action, acc);
    }
}
```

来看看` LazyIterator.hasNextService() `方法，该方法主要是**负责查找 META-INF/services 目录下的 SPI 配置文件**，并进行遍历，大致实现如下所示：

```java
private static final String PREFIX = "META-INF/services/"; 
Enumeration<URL> configs = null; 
Iterator<String> pending = null; 
String nextName = null; 
private boolean hasNextService() {
            if (nextName != null) {
                return true;
            }
            if (configs == null) {
                try {
                    // PREFIX前缀与服务接口的名称拼接起来，就是META-INF目录下定义的SPI配 
								    // 置文件(即示例中的META-INF/services/com.xxx.Log) 
                    String fullName = PREFIX + service.getName();
                  	// 加载配置文件 
                    if (loader == null)
                        configs = ClassLoader.getSystemResources(fullName);
                    else
                        configs = loader.getResources(fullName);
                } catch (IOException x) {
                    fail(service, "Error locating configuration files", x);
                }
            }
						// 按行SPI遍历配置文件的内容
            while ((pending == null) || !pending.hasNext()) {
                if (!configs.hasMoreElements()) {
                    return false;
                }
              	// 解析配置文件
                pending = parse(service, configs.nextElement());
            }
            nextName = pending.next();
            return true;
        }
```

在 `hasNextService()` 方法中完成 SPI 配置文件的解析之后，再来看` LazyIterator.nextService() `方法，该方法**负责实例化 `hasNextService()` 方法读取到的实现类**，其中会将实例化的对象放到 providers 集合中缓存起来，核心实现如下所示：

```java
private S nextService() {
    if (!hasNextService())
        throw new NoSuchElementException();
    String cn = nextName;
    nextName = null;
    Class<?> c = null;
    try {
      	// 加载 nextName字段指定的类 
        c = Class.forName(cn, false, loader);
    } catch (ClassNotFoundException x) {
        fail(service,
             "Provider " + cn + " not found");
    }
    if (!service.isAssignableFrom(c)) {
        fail(service,
             "Provider " + cn  + " not a subtype");
    }
    try {
    		// 创建实现类的对象 
        S p = service.cast(c.newInstance());
      	// 将实现类名称以及相应实例对象添加到缓存 
        providers.put(cn, p);
        return p;
    } catch (Throwable x) {
        fail(service,
             "Provider " + cn + " could not be instantiated",
             x);
    }
    throw new Error();          // This cannot happen
}
```

以上就是Java SPI的核心实现。

## Java SPI 在JDBC的应用

JDK 中只定义了一个 java.sql.Driver 接口，具体的实现是由不同数据库厂商来提供的。这里我们就以 MySQL 提供的 JDBC 实现包为例进行分析。

 在 mysql-connector-java-*.jar 包中的 META-INF/services 目录下，有一个 java.sql.Driver 文件中只有一行内容，如下所示：

![image-20230401214849877](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230401214849877.png)

在使用 mysql-connector-java-*.jar 包连接 MySQL 数据库的时候，我们会用到如下语句创建数据库连接：

```java
String url = "jdbc:xxx://xxx:xxx/xxx"; 
Connection conn = DriverManager.getConnection(url, username, pwd); 
```

**DriverManager 是 JDK 提供的数据库驱动管理器**，其中的静态代码块，如下所示：

```java
static {
    loadInitialDrivers();
    println("JDBC DriverManager initialized");
}
```

在调用 getConnection() 方法的时候，DriverManager 类会被 Java 虚拟机加载、解析并触发 static 代码块的执行。

在 loadInitialDrivers() 方法中通过 JDK SPI 扫描 Classpath 下 java.sql.Driver 接口实现类并实例化，核心实现如下所示：

```java
private static void loadInitialDrivers() {
        String drivers;
        try {
            drivers = AccessController.doPrivileged(new PrivilegedAction<String>() {
                public String run() {
                    return System.getProperty("jdbc.drivers");
                }
            });
        } catch (Exception ex) {
            drivers = null;
        }
        // If the driver is packaged as a Service Provider, load it.
        // Get all the drivers through the classloader
        // exposed as a java.sql.Driver.class service.
        // ServiceLoader.load() replaces the sun.misc.Providers()

        AccessController.doPrivileged(new PrivilegedAction<Void>() {
            public Void run() {
								// 使用 JDK SPI机制加载所有 java.sql.Driver实现类 
                ServiceLoader<Driver> loadedDrivers = ServiceLoader.load(Driver.class);
                Iterator<Driver> driversIterator = loadedDrivers.iterator();

                /* Load these drivers, so that they can be instantiated.
                 * It may be the case that the driver class may not be there
                 * i.e. there may be a packaged driver with the service class
                 * as implementation of java.sql.Driver but the actual class
                 * may be missing. In that case a java.util.ServiceConfigurationError
                 * will be thrown at runtime by the VM trying to locate
                 * and load the service.
                 *
                 * Adding a try catch block to catch those runtime errors
                 * if driver not available in classpath but it's
                 * packaged as service and that service is there in classpath.
                 */
                try{
                    while(driversIterator.hasNext()) {
                        driversIterator.next();
                    }
                } catch(Throwable t) {
                // Do nothing
                }
                return null;
            }
        });

        println("DriverManager.initialize: jdbc.drivers = " + drivers);

        if (drivers == null || drivers.equals("")) {
            return;
        }
        String[] driversList = drivers.split(":");
        println("number of Drivers:" + driversList.length);
  			// 初始化Driver实现类 
        for (String aDriver : driversList) {
            try {
                println("DriverManager.Initialize: loading " + aDriver);
                Class.forName(aDriver, true,
                        ClassLoader.getSystemClassLoader());
            } catch (Exception ex) {
                println("DriverManager.Initialize: load failed: " + ex);
            }
        }
    }
```

## 总结

使用Java SPI机制的优势是实现解耦，使得第三方服务模块的装配控制的逻辑与调用者的业务代码分离，而不是耦合在一起。应用程序可以根据实际业务情况启用框架扩展或替换框架组件。
