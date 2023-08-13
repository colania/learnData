---
title: ConcurrentHashMap 源码分析
date: 2023-03-18 11:29:10
categories:
	- coding
tags:
  - JAVA
---

## ConcurrentHashMap类图

![image-20230321163458604](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230321163458604.png)

根据类图看出来，ConcurrentHashMap实现了 Map 接口，继承了 AbstractMap 抽象类，所以大多数的方法也都和我们平时用到的HashMap是相同的，HashMap 有的方法，ConcurrentHashMap 几乎都有，所以当我们需要从 HashMap 切换到 ConcurrentHashMap 时，无需关心两者之间的兼容问题。

## **ConcurrentHashMap几个重要概念** 

### 重要参数

```java
//最大容量是1<<30 ,即2^30.int类型是32位整型,但是java中存放的是补码，2^31=-2147483648，考虑到扩容的情况下，选择2^30. 
private static final int MAXIMUM_CAPACITY = 1 << 30;
private static final int DEFAULT_CAPACITY = 16;
//链表长度达到8就转成红黑树，当长度降到6就转成普通链表。时间和空间的权衡
static final int TREEIFY_THRESHOLD = 8;
static final int UNTREEIFY_THRESHOLD = 6;
static final int MIN_TREEIFY_CAPACITY = 64;
static final int MOVED     = -1; // 表示正在转移
static final int TREEBIN   = -2; // 表示已经转换成树
static final int RESERVED  = -3; // hash for transient reservations
static final int HASH_BITS = 0x7fffffff; // usable bits of normal node hash
transient volatile Node<K,V>[] table;//默认没初始化的数组，用来保存元素
private transient volatile Node<K,V>[] nextTable;//转移的时候用的数组
/**
* 用来控制表初始化和扩容的，默认值为0，当在初始化的时候指定了大小，这会将这个大小保存在sizeCtl中，大小为* 数组的0.75
* 当为负的时候，说明表正在初始化或扩张，
*     -1表示初始化
*     -(1+n) n:表示活动的扩张线程
*/
private transient volatile int sizeCtl;
```

### 重要结构

1. Node<K,V>,这是构成每个元素的基本类。

```java
static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        volatile V val;
        volatile Node<K,V> next;
  			Node(int hash, K key, V val, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.val = val;
            this.next = next;
        }
}
```

2. TreeNode构造树的节点

```java
static final class TreeNode<K,V> extends Node<K,V> {
        TreeNode<K,V> parent;  // red-black tree links
        TreeNode<K,V> left;
        TreeNode<K,V> right;
        TreeNode<K,V> prev;    // needed to unlink next upon deletion
        boolean red;

        TreeNode(int hash, K key, V val, Node<K,V> next,
                 TreeNode<K,V> parent) {
            super(hash, key, val, next);
            this.parent = parent;
        }
}

static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        volatile V val;
        volatile Node<K,V> next;
 }
```

3. TreeBin 不保存用户键或值，而是指向 TreeNode 及其根的列表，由TreeBin完成对红黑树的包装。他们还维护一个读写锁。

```java
static final class TreeBin<K,V> extends Node<K,V> {
        TreeNode<K,V> root;
        volatile TreeNode<K,V> first;
        volatile Thread waiter;
        volatile int lockState;
        // values for lockState
        static final int WRITER = 1; // set while holding write lock
        static final int WAITER = 2; // set when waiting for write lock
        static final int READER = 4; // increment value for setting read lock
}
```

### 重要锁

1. **Unsafe CAS**

在ConcurrentHashMap中，随处可见**<big>U.compareAndSwapObject</big>**等类似的方法。这个算法的基本思想就是不断地去比较当前内存中的变量值与你指定的一个变量值是否相等，如果相等，则接受你指定的修改的值，否则拒绝你的操作。与我们常见的**乐观锁**类似。

> Unsafe是位于sun.misc包下的一个类，主要提供一些用于执行低级别、不安全操作的方法，如直接访问系统内存资源、自主管理内存资源等，这些方法在提升Java运行效率、增强Java语言底层资源操作能力方面起到了很大的作用。但由于Unsafe类使Java语言拥有了类似C语言指针一样操作内存空间的能力，这无疑也增加了程序发生相关指针问题的风险。在程序中过度、不正确使用Unsafe类会使得程序出错的概率变大，使得Java这种安全的语言变得不再“安全”

```java
 //获得在i位置上的Node节点
 static final <K,V> Node<K,V> tabAt(Node<K,V>[] tab, int i) {
 		return (Node<K,V>)U.getObjectVolatile(tab, ((long)i << ASHIFT) + ABASE);
 }
 //利用CAS算法设置i位置上的Node节点。之所以能实现并发是因为他指定了原来这个节点的值是多少
 //在CAS算法中，会比较内存中的值与你指定的这个值是否相等，如果相等才接受你的修改，否则拒绝你的修改
 static final <K,V> boolean casTabAt(Node<K,V>[] tab, int i,Node<K,V> c, Node<K,V> v) {
 		return U.compareAndSwapObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
 }
 //利用volatile方法设置节点位置的值
 static final <K,V> void setTabAt(Node<K,V>[] tab, int i, Node<K,V> v) {
 		U.putObjectVolatile(tab, ((long)i << ASHIFT) + ABASE, v);
 }
```

2. synchronized

   *synchronized*是Java中的关键字，是一种同步锁.

```java
//存放新值时会进行加锁
synchronized (f) {
  if (tabAt(tab, i) == f) {...}
	else if (f instanceof TreeBin) {...}
  }                    
```



## 方法拆解

### 1. 构造方法

​	在任何一个构造方法中，都没有对存储Map元素Node的table变量进行初始化。而是在第一次put操作的时候在进行初始化。

```java
public ConcurrentHashMap() {
}
//如果在实例化对象的时候指定了容量，则初始化sizeCtl
public ConcurrentHashMap(int initialCapacity) {
  if (initialCapacity < 0)
    throw new IllegalArgumentException();
  int cap = ((initialCapacity >= (MAXIMUM_CAPACITY >>> 1)) ?
             MAXIMUM_CAPACITY :
             tableSizeFor(initialCapacity + (initialCapacity >>> 1) + 1));
  this.sizeCtl = cap;
}
//当存入一个Map的时候，先设定sizeCtl为默认容量，在添加元素
public ConcurrentHashMap(Map<? extends K, ? extends V> m) {
  this.sizeCtl = DEFAULT_CAPACITY;
  putAll(m);
}
```

```java

/**
* 初始化数组table，
* 如果sizeCtl小于0，说明别的数组正在进行初始化，则让出执行权
* 如果sizeCtl大于0的话，则初始化一个大小为sizeCtl的数组
* 否则的话初始化一个默认大小(16)的数组
* 然后设置sizeCtl的值为数组长度的3/4
*/
private final Node<K,V>[] initTable() {
  Node<K,V>[] tab; int sc;
  //第一次put的时候，table还没被初始化，进入while
  while ((tab = table) == null || tab.length == 0) {
    //sizeCtl初始值为0，当小于0的时候表示在别的线程在初始化表或扩展表
    if ((sc = sizeCtl) < 0)     
      // 断片
      Thread.yield(); 
    //SIZECTL：表示当前对象的内存偏移量，sc表示期望值，-1表示要替换的值，设定为-1表示要初始化表了
    else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {    
      try {
        if ((tab = table) == null || tab.length == 0) {
          //指定了大小的时候就创建指定大小的Node数组，否则创建指定大小(16)的Node数组
          int n = (sc > 0) ? sc : DEFAULT_CAPACITY;        
          @SuppressWarnings("unchecked")
          Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
          table = tab = nt;
          //n>>>2 代表n向右移动2位，即n/4
          sc = n - (n >>> 2);
        }
      } finally {
        //初始化后，sizeCtl长度为数组长度的3/4
        sizeCtl = sc;            
      }
      break;
    }
  }
  return tab;
}
```



### 2. PUT

```java
/*
*  单调用putVal方法，并且putVal的第三个参数设置为false
*  当设置为false的时候表示这个value一定会设置
*  true的时候，只有当这个key的value为空的时候才会设置
*/
public V put(K key, V value) {
	return putVal(key, value, false);
}
```

```java
/*
* 当添加一对键值对的时候，首先会去判断保存这些键值对的数组是不是初始化了，
* 如果没有的话就初始化数组
*  然后通过计算hash值来确定放在数组的哪个位置
* 如果这个位置为空则直接添加，如果不为空的话，则取出这个节点来
* 如果取出来的节点的hash值是MOVED(-1)的话，则表示当前正在对这个数组进行扩容，复制到新的数组，则当前线程也去帮助复制
* 最后一种情况就是，如果这个节点，不为空，也不在扩容，则通过synchronized来加锁，进行添加操作
*    然后判断当前取出的节点位置存放的是链表还是树
*    如果是链表的话，则遍历整个链表，直到取出来的节点的key来个要放的key进行比较，如果key相等，并且key的hash值也相等的话，
*          则说明是同一个key，则覆盖掉value，否则的话则添加到链表的末尾
*    如果是树的话，则调用putTreeVal方法把这个元素添加到树中去
*  最后在添加完成之后，会判断在该节点处共有多少个节点（注意是添加前的个数），如果达到8个以上了的话，
*  则调用treeifyBin方法来尝试将处的链表转为树，或者扩容数组
*/
final V putVal(K key, V value, boolean onlyIfAbsent) {
			  //K,V都不能为空，否则的话跑出异常
        if (key == null || value == null) throw new NullPointerException();
        int hash = spread(key.hashCode());
        int binCount = 0;
        for (Node<K,V>[] tab = table;;) {
            Node<K,V> f; int n, i, fh;
          	//判断容器是否初始化，如果容器没有初始化，则调用 initTable 方法初始化，初始化一个node数组。
            if (tab == null || (n = tab.length) == 0)
                tab = initTable();
          	//根据hash找到数组对应的下标位置，如果该位置未存放节点，也就是说不存在 hash 冲突，则使用 CAS 无锁的方式将数据添加到容器中，并且结束循环。
          	// tabAt(tab, i = (n - 1) & hash)可以判断将要插入的位置是否已经有元素
            else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
                if (casTabAt(tab, i, null,
                             new Node<K,V>(hash, key, value, null)))
                    break;                   // no lock when adding to empty bin
            }
						//如果检测到某个节点的hash值是MOVED，则表示正在进行数组扩张的数据复制阶段，
          	//则当前线程也会参与去复制，通过允许多线程复制的功能，一次来减少数组的复制所带来的性能损失
            else if ((fh = f.hash) == MOVED)
                tab = helpTransfer(tab, f);
            else {
                 //如果在这个位置有元素的话，就采用synchronized的方式加锁，
                 //如果是链表的话(hash大于0)，就对这个链表的所有元素进行遍历，
                 //如果找到了key和key的hash值都一样的节点，则把它的值替换到
                 //			如果没找到的话，则添加在链表的最后面
                 //			否则，是树的话，则调用putTreeVal方法添加到树中去
                 //在添加完之后，会对该节点上关联的的数目进行判断，
                 //			如果在8个以上的话，则会调用treeifyBin方法，来尝试转化为树，或者是扩容
                V oldVal = null;
                synchronized (f) {
                  		//这个位置有元素的话
                    if (tabAt(tab, i) == f) {
                      	//取出来的元素的hash值大于0，当转换为树之后，hash值为-2
                        if (fh >= 0) {
                            binCount = 1;
                            for (Node<K,V> e = f;; ++binCount) {
                                K ek;
                              //要存的元素的hash，key跟要存储的位置的节点的相同的时候，替换掉该节点的value即可
                                if (e.hash == hash &&
                                    ((ek = e.key) == key ||
                                     (ek != null && key.equals(ek)))) {
                                    oldVal = e.val;
                                    if (!onlyIfAbsent)
                                        e.val = value;
                                    break;
                                }
                                Node<K,V> pred = e;
                              	//如果不是同样的hash，同样的key的时候，则判断该节点的下一个节点是否为空,为空的话把这个要加入的节点设置为当前节点的下一个节点
                                if ((e = e.next) == null) {
                                    pred.next = new Node<K,V>(hash, key,
                                                              value, null);
                                    break;
                                }
                            }
                        }
                      //已经转化成红黑树类型了
                        else if (f instanceof TreeBin) {
                            Node<K,V> p;
                            binCount = 2;
                          	//调用putTreeVal方法，将该元素添加到树中去
                            if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                           value)) != null) {
                                oldVal = p.val;
                                if (!onlyIfAbsent)
                                    p.val = value;
                            }
                        }
                    }
                }
                if (binCount != 0) {
                  	//当在同一个节点的数目达到8个的时候，则扩张数组或将给节点的数据转为tree
                    if (binCount >= TREEIFY_THRESHOLD)
                        treeifyBin(tab, i);
                    if (oldVal != null)
                        return oldVal;
                    break;
                }
            }
        }
  			//计数
        addCount(1L, binCount);
        return null;
    }
```



### 3. ConcurrentHashMap的扩容详解

* 在同一个节点的个数超过8个的时候，会调用treeifyBin方法来看看是扩容还是转化为一棵树
* 同时在每次添加完元素的addCount方法中，也会判断当前数组中的元素是否达到了sizeCtl的量，如果达到了的话，则会进入transfer方法去扩容

```java
//当数组长度小于64的时候，扩张数组长度一倍，否则的话把链表转为树
private final void treeifyBin(Node<K,V>[] tab, int index) {
        Node<K,V> b; int n, sc;
        if (tab != null) {
            if ((n = tab.length) < MIN_TREEIFY_CAPACITY)
              	//数组扩容
                tryPresize(n << 1);
            else if ((b = tabAt(tab, index)) != null && b.hash >= 0) {
              	//生成TreeNode后填充到TreeBin,头结点仍然放在相同的位置，锁住链表的头结点位置，对后续的节点生成TreeNode生成树
                synchronized (b) {
                    if (tabAt(tab, index) == b) {
                        TreeNode<K,V> hd = null, tl = null;
                        for (Node<K,V> e = b; e != null; e = e.next) {
                            TreeNode<K,V> p =
                                new TreeNode<K,V>(e.hash, e.key, e.val,
                                                  null, null);
                            if ((p.prev = tl) == null)
                                hd = p;
                            else
                                tl.next = p;
                            tl = p;
                        }
                        setTabAt(tab, index, new TreeBin<K,V>(hd));
                    }
                }
            }
        }
    }
```

在tryPresize方法中，并没有加锁，允许多个线程进入，如果数组正在扩张，则当前线程也去帮助扩容。

```java
private final void tryPresize(int size) {
  			//找到比输入大的，并且与输入相邻的2的次方数,否则就是MAXIMUM_CAPACITY
        int c = (size >= (MAXIMUM_CAPACITY >>> 1)) ? MAXIMUM_CAPACITY :
            tableSizeFor(size + (size >>> 1) + 1);
        int sc;
        while ((sc = sizeCtl) >= 0) {
            Node<K,V>[] tab = table; int n;
          	//这里是putAll方法直接put一个map的话，在putALl方法中没有调用initTable方法去初始化								table，而是直接调用了tryPresize方法
            if (tab == null || (n = tab.length) == 0) {
                n = (sc > c) ? sc : c;
                if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
                    try {
                        if (table == tab) {
                            @SuppressWarnings("unchecked")
                            Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                            table = nt;
                            sc = n - (n >>> 2);
                        }
                    } finally {
                        sizeCtl = sc;
                    }
                }
            }
          	//一直扩容到的c小于等于sizeCtl或者数组长度大于最大长度的时候，则退出
            else if (c <= sc || n >= MAXIMUM_CAPACITY)
                break;
            else if (tab == table) {
              	//扩容戳。保障当前扩容范围唯一性，高16位表示扩容标记，低16位表示当前扩容数量
                int rs = resizeStamp(n);
              	//如果sizeCtl<0表示当前有线程正在正在扩容，则帮助扩容；否则的话，开始新的扩容
                if (sc < 0) {
                    Node<K,V>[] nt;
                  	//迁移完了，break
                    if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                        sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                        transferIndex <= 0)
                        break;
                  		//transfer的线程数加一,该线程将进行transfer的帮忙
                      //sc表示在transfer工作的线程数
                  		//保证所有线程完成了迁移动作，才能表示扩容完成。
                    if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                        transfer(tab, nt);
                }
              	//第一次扩容走这里，开始全新的扩容
                else if (U.compareAndSwapInt(this, SIZECTL, sc,
                                             (rs << RESIZE_STAMP_SHIFT) + 2))
                    transfer(tab, null);
            }
        }
    }
```

```java
//找到比输入大的，并且与输入相邻的2的次方数
private static final int tableSizeFor(int c) {
        int n = c - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }
```

```java
//Integer.numberOfLeadingZeros(n)用于计算n转换成二进制后前面有几个0
//(1 << (RESIZE_STAMP_BITS - 1)即是1<<15，表示为二进制即是高16位为0，低16位为1
//resizeStamp(n)的返回值为：高16位置0，第16位为1，低15位存放当前容量n，用于表示是对n的扩容
static final int resizeStamp(int n) {
        return Integer.numberOfLeadingZeros(n) | (1 << (RESIZE_STAMP_BITS - 1));
    }
```



扩容操作：

```java
     // 把数组中的节点复制到新的数组的相同位置，或者移动到扩张部分的相同位置
     // 在这里首先会计算一个步长，表示一个线程处理的数组长度，用来控制对CPU的使用，
     // 每个CPU最少处理16个长度的数组元素,也就是说，如果一个数组的长度只有16，那只有一个线程会对其进行扩容的复制移动操作
     // 扩容的时候会一直遍历，知道复制完所有节点，没处理一个节点的时候会在链表的头部设置一个fwd节点，这样其他线程就会跳过他，
		// 实现数据的转移
				// 红黑树：迁移后不满足红黑树条件，转链表
				// 链表： 高低位迁移
private final void transfer(Node<K,V>[] tab, Node<K,V>[] nextTab) {
        int n = tab.length, stride;
        if ((stride = (NCPU > 1) ? (n >>> 3) / NCPU : n) < MIN_TRANSFER_STRIDE)
            stride = MIN_TRANSFER_STRIDE; // subdivide range
        if (nextTab == null) {            // initiating
            try {
                @SuppressWarnings("unchecked")
                Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n << 1];
                nextTab = nt;
            } catch (Throwable ex) {      // try to cope with OOME
                sizeCtl = Integer.MAX_VALUE;
                return;
            }
            nextTable = nextTab;
            transferIndex = n;
        }
        int nextn = nextTab.length; 
  			//用来表示已经迁移完的节点，如果数组的某个节点迁移完了，需要更改成fwd
        ForwardingNode<K,V> fwd = new ForwardingNode<K,V>(nextTab);
        boolean advance = true;
        boolean finishing = false; // to ensure sweep before committing nextTab
	//  通过for自循环处理每个槽位中的链表元素，默认advace为真，通过CAS设置transferIndex属性值，并初始化i和bound值，i指当前处理的槽位序号，bound指需要处理的槽位边界，先处理槽位15的节点；
        for (int i = 0, bound = 0;;) {
            Node<K,V> f; int fh;
            while (advance) {
                int nextIndex, nextBound;
                if (--i >= bound || finishing)
                    advance = false;
                else if ((nextIndex = transferIndex) <= 0) {
                    i = -1;
                    advance = false;
                }
                else if (U.compareAndSwapInt
                         (this, TRANSFERINDEX, nextIndex,
                          nextBound = (nextIndex > stride ?
                                       nextIndex - stride : 0))) {
                    bound = nextBound;
                    i = nextIndex - 1;
                    advance = false;
                }
            }
            if (i < 0 || i >= n || i + n >= nextn) {
                int sc;
                if (finishing) {
                    nextTable = null;
                    table = nextTab;
                    sizeCtl = (n << 1) - (n >>> 1);
                    return;
                }
                if (U.compareAndSwapInt(this, SIZECTL, sc = sizeCtl, sc - 1)) {
                    if ((sc - 2) != resizeStamp(n) << RESIZE_STAMP_SHIFT)
                        return;
                    finishing = advance = true;
                    i = n; // recheck before commit
                }
            }
          	//没有节点，则通过CAS插入在第二步中初始化的ForwardingNode节点，告诉其它线程该槽位已经处理过了
            else if ((f = tabAt(tab, i)) == null)
                advance = casTabAt(tab, i, null, fwd);
          //如果被处理过了，另外一个线程处理到这个节点时，取到该节点的hash值应该为MOVED，值为-1，则直接跳过，继续处理下一个槽位节点；
            else if ((fh = f.hash) == MOVED)
                advance = true; // already processed
            else {
                synchronized (f) {
                    if (tabAt(tab, i) == f) {
                        Node<K,V> ln, hn;
                        if (fh >= 0) {
                          //使用fn&n可以快速把链表中的元素区分成两类，A类是hash值的第X位为0，B类是hash值的第X位为1，并通过lastRun记录最后需要处理的节点.
                            int runBit = fh & n;
                            Node<K,V> lastRun = f;
                            for (Node<K,V> p = f.next; p != null; p = p.next) {
                                int b = p.hash & n;
                                if (b != runBit) {
                                    runBit = b;
                                    lastRun = p;
                                }
                            }
                            if (runBit == 0) {
                                ln = lastRun;
                                hn = null;
                            }
                            else {
                                hn = lastRun;
                                ln = null;
                            }
                            for (Node<K,V> p = f; p != lastRun; p = p.next) {
                                int ph = p.hash; K pk = p.key; V pv = p.val;
                                if ((ph & n) == 0)
                                    ln = new Node<K,V>(ph, pk, pv, ln);
                                else
                                    hn = new Node<K,V>(ph, pk, pv, hn);
                            }
                            setTabAt(nextTab, i, ln);
                            setTabAt(nextTab, i + n, hn);
                            setTabAt(tab, i, fwd);
                            advance = true;
                        }
                        else if (f instanceof TreeBin) {
                            TreeBin<K,V> t = (TreeBin<K,V>)f;
                            TreeNode<K,V> lo = null, loTail = null;
                            TreeNode<K,V> hi = null, hiTail = null;
                            int lc = 0, hc = 0;
                            for (Node<K,V> e = t.first; e != null; e = e.next) {
                                int h = e.hash;
                                TreeNode<K,V> p = new TreeNode<K,V>
                                    (h, e.key, e.val, null, null);
                                if ((h & n) == 0) {
                                    if ((p.prev = loTail) == null)
                                        lo = p;
                                    else
                                        loTail.next = p;
                                    loTail = p;
                                    ++lc;
                                }
                                else {
                                    if ((p.prev = hiTail) == null)
                                        hi = p;
                                    else
                                        hiTail.next = p;
                                    hiTail = p;
                                    ++hc;
                                }
                            }
                            ln = (lc <= UNTREEIFY_THRESHOLD) ? untreeify(lo) :
                                (hc != 0) ? new TreeBin<K,V>(lo) : t;
                            hn = (hc <= UNTREEIFY_THRESHOLD) ? untreeify(hi) :
                                (lc != 0) ? new TreeBin<K,V>(hi) : t;
                            setTabAt(nextTab, i, ln);
                            setTabAt(nextTab, i + n, hn);
                            setTabAt(tab, i, fwd);
                            advance = true;
                        }
                    }
                }
            }
        }
    }
```

使用`fn&n`可以快速把链表中的元素区分成两类，A类是hash值的第X位为0，B类是hash值的第X位为1，并通过`lastRun`记录最后需要处理的节点，A类和B类节点可以分散到新数组的槽位14和30中，在原数组的槽位中，蓝色节点第X为0，红色节点第X为1，把链表拉平显示如下：

![img](https://upload-images.jianshu.io/upload_images/2184951-5e60c316353e8a8f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. 通过遍历链表，记录`runBit`和`lastRun`，分别为1和节点6，所以设置`hn`为节点6，`ln`为null；

2. 重新遍历链表，以`lastRun`节点为终止条件，根据第X位的值分别构造ln链表和hn链表：

   1. ln：

   ![ln链](https://upload-images.jianshu.io/upload_images/2184951-00e946e7b274a8af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

   2. Hn:

      ![img](https://upload-images.jianshu.io/upload_images/2184951-bcc2a0170ec52d9d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 通过CAS把ln链表设置到新数组的i位置，hn链表设置到i+n的位置；

如果该槽位是红黑树结构，则构造树节点`lo`和`hi`，遍历红黑树中的节点，同样根据`hash&n`[算法](http://lib.csdn.net/base/datastructure)，把节点分为两类，分别插入到`lo`和`hi`为头的链表中，根据`lo`和`hi`链表中的元素个数分别生成`ln`和`hn`节点，其中`ln`节点的生成逻辑如下：

1. 如果`lo`链表的元素个数小于等于`UNTREEIFY_THRESHOLD`，默认为6，则通过`untreeify`方法把树节点链表转化成普通节点链表；
2. 否则判断`hi`链表中的元素个数是否等于0：如果等于0，表示`lo`链表中包含了所有原始节点，则设置原始红黑树给`ln`，否则根据`lo`链表重新构造红黑树。
3. 最后，同样的通过CAS把`ln`设置到新数组的`i`位置，`hn`设置到`i+n`位置。

​	

### 4. GET

```java
/*
 * 相比put方法，get就很单纯了，支持并发操作，
 * 当key为null的时候回抛出NullPointerException的异常
 * get操作通过首先计算key的hash值来确定该元素放在数组的哪个位置
 * 然后遍历该位置的所有节点
 * 如果不存在的话返回null
 */
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    int h = spread(key.hashCode());
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

