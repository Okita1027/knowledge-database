import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,o as s,b as e}from"./app-CJZ--YWM.js";const t={},o=e(`<h2 id="beanfactory与applicationcontext" tabindex="-1"><a class="header-anchor" href="#beanfactory与applicationcontext"><span>BeanFactory与ApplicationContext</span></a></h2><ol><li>BeanFactory是Spring的早期接口，称为Spring的Bean工厂，ApplicationContext是后期更高级接口，称之为 Spring 容器；</li><li>ApplicationContext在BeanFactory基础上对功能进行了扩展，例如：监听功能、国际化功能等。BeanFactory的API更偏向底层，ApplicationContext的API大多数是对这些底层API的封装；</li><li>Bean创建的主要逻辑和功能都被封装在BeanFactory中，ApplicationContext不仅继承了BeanFactory，而且 ApplicationContext内部还维护着BeanFactory的引用，所以，ApplicationContext与BeanFactory既有继承关系，又有融合关系。</li><li>Bean的初始化时机不同，原始BeanFactory是在首次调用getBean时才进行Bean的创建，而ApplicationContext则是配置文件加载，容器一创建就将Bean都实例化并初始化好。</li></ol><p>ApplicationContext除了继承了BeanFactory外，还继承了ApplicationEventPublisher（事件发布器）、ResouresPatternResolver（资源解析器）、MessageSource（消息资源）等。但是ApplicationContext的核心功能还是BeanFactory。applicationContext内部还维护着beanFactory的引用。<br><img src="https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171711714.png" alt="image.png" loading="lazy"><br><img src="https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171711971.png" alt="image.png" loading="lazy"></p><h2 id="beanfactory和facotrybean" tabindex="-1"><a class="header-anchor" href="#beanfactory和facotrybean"><span>BeanFactory和FacotryBean</span></a></h2><ul><li>BeanFactory：Spring IOC容器的顶级对象，翻译为“Bean工厂”，负责创建对象。</li><li>FactoryBean：是一个Bean，用于辅助Spring实例化其它Bean对象的一个Bean。 <ul><li>Spring中，Bean可以分为普通Bean和工厂Bean，工厂Bean也是一种Bean，只不过较为特殊。</li></ul></li></ul><h2 id="spring后处理器" tabindex="-1"><a class="header-anchor" href="#spring后处理器"><span>Spring后处理器</span></a></h2><h3 id="bean工厂后处理器-–-beanfactorypostprocessor" tabindex="-1"><a class="header-anchor" href="#bean工厂后处理器-–-beanfactorypostprocessor"><span>Bean工厂后处理器 – BeanFactoryPostProcessor</span></a></h3><p>postProcessBeanFactory的参数本质就是 DefaultListableBeanFactory，拿到BeanFactory的引用，自然就可以对beanDefinitionMap中的BeanDefinition进行操作了 ，例如把配置文件中原本的Bean修改成其他Bean、注入原本不存在配置文件中的Bean……<br> BeanFactoryPostProcessor是在所有BeanDefinition加载完毕后执行的一次操作.</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyBeanFactoryPostProcessor</span> <span class="token keyword">implements</span> <span class="token class-name">BeanFactoryPostProcessor</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">postProcessBeanFactory</span><span class="token punctuation">(</span><span class="token class-name">ConfigurableListableBeanFactory</span> configurableListableBeanFactory<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>
        <span class="token comment">/* System.out.println(&quot;通过自定义BeanFactoryPostProcessor将FruitService注入成了Rubbish&quot;); */</span>
        <span class="token class-name">BeanDefinition</span> beanDefinition <span class="token operator">=</span> configurableListableBeanFactory<span class="token punctuation">.</span><span class="token function">getBeanDefinition</span><span class="token punctuation">(</span><span class="token string">&quot;fruitService&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        beanDefinition<span class="token punctuation">.</span><span class="token function">setBeanClassName</span><span class="token punctuation">(</span><span class="token string">&quot;com.qzy.service.impl.Rubbish&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/* System.out.println(&quot;没有在XML配置文件中配置Bean，在BeanFactory后处理器中自定义添加BeanDefinition实现DrinkDao的注入&quot;); */</span>
        <span class="token class-name">DefaultListableBeanFactory</span> listableBeanFactory <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">DefaultListableBeanFactory</span><span class="token punctuation">)</span> configurableListableBeanFactory<span class="token punctuation">;</span>
        <span class="token class-name">RootBeanDefinition</span> rootBeanDefinition <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RootBeanDefinition</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        rootBeanDefinition<span class="token punctuation">.</span><span class="token function">setBeanClassName</span><span class="token punctuation">(</span><span class="token string">&quot;com.qzy.dao.impl.DrinkDaoImpl&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        listableBeanFactory<span class="token punctuation">.</span><span class="token function">registerBeanDefinition</span><span class="token punctuation">(</span><span class="token string">&quot;drinkDao&quot;</span><span class="token punctuation">,</span> rootBeanDefinition<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;step-3 =》 调用了MyBeanFactoryPostProcessor的postProcessBeanFactory方法&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-xml line-numbers-mode" data-ext="xml" data-title="xml"><pre class="language-xml"><code><span class="token comment">&lt;!-- 不需要id,只需要class,配置完毕后自动生效 --&gt;</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>bean</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>com.qzy.processor.MyBeanFactoryPostProcessor<span class="token punctuation">&quot;</span></span><span class="token punctuation">/&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>将new出来的对象加入IOC容器</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token class-name">Fruit</span> fruit <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Fruit</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">DefaultListableBeanFactory</span> factory <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">DefaultListableBeanFactory</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
factory<span class="token punctuation">.</span><span class="token function">registerSingleton</span><span class="token punctuation">(</span><span class="token string">&quot;Fruit&quot;</span><span class="token punctuation">,</span> fruit<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">Fruit</span> bean <span class="token operator">=</span> factory<span class="token punctuation">.</span><span class="token function">getBean</span><span class="token punctuation">(</span><span class="token string">&quot;Fruit&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Fruit</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;fruit == bean ？ -&gt; &quot;</span> <span class="token operator">+</span> <span class="token punctuation">(</span>fruit <span class="token operator">==</span> bean<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>	<span class="token comment">//true</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="beandefinitionregistrypostprocessor" tabindex="-1"><a class="header-anchor" href="#beandefinitionregistrypostprocessor"><span>BeanDefinitionRegistryPostProcessor</span></a></h4><p>BeanDefinitionRegistryPostProcessor是BeanFactoryPostProcessor的子接口，专用于注测BeanDefinition。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyBeanDefinitionRegistryPostProcessor</span> <span class="token keyword">implements</span> <span class="token class-name">BeanDefinitionRegistryPostProcessor</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * 自己（BeanDefinitionRegistryPostProcessor）的方法
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">postProcessBeanDefinitionRegistry</span><span class="token punctuation">(</span><span class="token class-name">BeanDefinitionRegistry</span> beanDefinitionRegistry<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;step-1 =》 调用了MyBeanDefinitionRegistryPostProcessor的postProcessBeanDefinitionRegistry方法&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">RootBeanDefinition</span> beanDefinition <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RootBeanDefinition</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        beanDefinition<span class="token punctuation">.</span><span class="token function">setBeanClassName</span><span class="token punctuation">(</span><span class="token string">&quot;com.qzy.dao.impl.EatDaoImpl&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        beanDefinitionRegistry<span class="token punctuation">.</span><span class="token function">registerBeanDefinition</span><span class="token punctuation">(</span><span class="token string">&quot;eatDao&quot;</span><span class="token punctuation">,</span> beanDefinition<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token doc-comment comment">/**
     * 父类（BeanFactoryPostProcessor）的方法
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">postProcessBeanFactory</span><span class="token punctuation">(</span><span class="token class-name">ConfigurableListableBeanFactory</span> configurableListableBeanFactory<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;step-2 =》 调用了MyBeanDefinitionRegistryPostProcessor的postProcessBeanFactory方法&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="bean后处理器-–-beanpostprocessor" tabindex="-1"><a class="header-anchor" href="#bean后处理器-–-beanpostprocessor"><span>Bean后处理器 – BeanPostProcessor</span></a></h3><p>Bean被实例化后，到最终缓存到名为singletonObjects单例池之前，中间会经过Bean的初始化过程，例如：属性的填充、初始方法init的执行等，其中有一个对外进行扩展的点BeanPostProcessor，我们称为Bean后处理。跟上面的Bean工厂后处理器相似，它也是一个接口，实现了该接口并被容器管理的BeanPostProcessor，会在流程节点上被Spring自动调用。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyBeanPostProcessor</span> <span class="token keyword">implements</span> <span class="token class-name">BeanPostProcessor</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * 可以对创建好的Bean在插入SingletonMap之前执行一些操作
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">Object</span> <span class="token function">postProcessBeforeInitialization</span><span class="token punctuation">(</span><span class="token class-name">Object</span> bean<span class="token punctuation">,</span> <span class="token class-name">String</span> beanName<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>

        <span class="token comment">//在配置文件中不初始化Bean的EatDao属性，此处获得Bean之后手动添加</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>bean <span class="token keyword">instanceof</span> <span class="token class-name">MyBeanPostServiceImpl</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">MyBeanPostServiceImpl</span> myBeanPostService <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">MyBeanPostServiceImpl</span><span class="token punctuation">)</span> bean<span class="token punctuation">;</span>
            myBeanPostService<span class="token punctuation">.</span><span class="token function">setEatDao</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">EatDaoImpl</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;postProcessBeforeInitialization……&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Bean后置处理器，可用于增强代码块
     * Spring中的许多增强实现如AOP、整合第三方Bean大多是通过生命周期中各个方法(init、initialingBean、前后处理器……)完成的
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">Object</span> <span class="token function">postProcessAfterInitialization</span><span class="token punctuation">(</span><span class="token class-name">Object</span> bean<span class="token punctuation">,</span> <span class="token class-name">String</span> beanName<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;postProcessAfterInitialization……&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">// MyBeanPostServiceImpl myBeanPostService = (MyBeanPostServiceImpl) bean;</span>
        <span class="token comment">//  return Proxy.newProxyInstance(myBeanPostService.getClass().getClassLoader(), myBeanPostService.getClass().getInterfaces(), (proxy, method, args) -&gt; {</span>
        <span class="token comment">//      System.out.println(&quot;增强代码块：当前时间-Begin&quot; + LocalDateTime.now());</span>
        <span class="token comment">//      Object result = method.invoke(myBeanPostService, args);</span>
        <span class="token comment">//      System.out.println(&quot;增强代码块：当前时间-End&quot; + LocalDateTime.now());</span>
        <span class="token comment">//      return result;</span>
        <span class="token comment">//  });</span>
        <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-xml line-numbers-mode" data-ext="xml" data-title="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>bean</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>myBeanPostService<span class="token punctuation">&quot;</span></span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>com.qzy.service.impl.MyBeanPostServiceImpl<span class="token punctuation">&quot;</span></span> <span class="token attr-name">init-method</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>init<span class="token punctuation">&quot;</span></span><span class="token punctuation">/&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>bean</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>com.qzy.processor.MyBeanPostProcessor<span class="token punctuation">&quot;</span></span><span class="token punctuation">/&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="bean实例化基本流程" tabindex="-1"><a class="header-anchor" href="#bean实例化基本流程"><span>Bean实例化基本流程</span></a></h2><p>详细流程往下看</p><ol><li>加载xml配置文件，解析获取配置中的每个<code>&lt;bean&gt;</code>的信息，封装成一个个的<code>BeanDefinition</code>对象;</li><li>将<code>BeanDefinition</code>存储在一个名为<code>beanDefinitionMap</code>的<code>Map&lt;String,BeanDefinition&gt;</code>中;</li><li><code>ApplicationContext</code>底层遍历<code>beanDefinitionMap</code>，利用反射创建Bean实例对象;</li><li>创建好的Bean实例对象，被存储到一个名为<code>singletonObjects的Map&lt;String,Object&gt;</code>中;</li><li>当执行<code>applicationContext.getBean(beanName)</code>时，从<code>singletonObjects</code>去匹配Bean实例返回。</li></ol><h2 id="bean的生命周期" tabindex="-1"><a class="header-anchor" href="#bean的生命周期"><span>Bean的生命周期</span></a></h2><p>Spring Bean的生命周期是从 Bean 实例化之后，即通过反射创建出对象之后，到Bean成为一个完整对象，最终存储到单例池中，这个过程被称为Spring Bean的生命周期。Spring Bean的生命周期大体上分为三个阶段：</p><ol><li>Bean的实例化阶段：Spring框架会取出BeanDefinition的信息进行判断当前Bean的范围是否是singleton的，是否不是延迟加载的，是否不是FactoryBean等，最终将一个普通的singleton的Bean通过反射进行实例化。</li><li>Bean的初始化阶段：Bean创建之后还仅仅是个&quot;半成品&quot;，还需要对Bean实例的属性进行填充、执行一些Aware接口方法、执行BeanPostProcessor方法、执行InitializingBean接口的初始化方法、执行自定义初始化init方法等。该阶段是Spring最具技术含量和复杂度的阶段，Aop增强功能，后面要学习的Spring的注解功能等、spring高频面试题Bean的循环引用问题都是在这个阶段体现的；</li><li>Bean的完成阶段：经过初始化阶段，Bean就成为了一个完整的Spring Bean，被存储到单例池singletonObjects中去了，即完成了Spring Bean的整个生命周期。</li></ol><p><strong>注意：</strong></p><ul><li>Spring容器只对singleton的Bean进行完整的生命周期管理。</li><li>如果是prototype作用域的Bean，Spring容器只负责将Bean初始化完毕。等客户端程序一旦获取到Bean之后，Spring容器就不再管理该对象的生命周期了。即不负责最后两步（检查是否实现了DisposableBean接口，并调用该方法、销毁Bean）</li></ul><h3 id="生命周期一览图" tabindex="-1"><a class="header-anchor" href="#生命周期一览图"><span>生命周期一览图</span></a></h3><table><thead><tr><th style="text-align:center;"><strong>黑色字</strong></th><th style="text-align:center;"><strong>五步法</strong></th></tr></thead><tbody><tr><td style="text-align:center;"><strong>蓝色字</strong></td><td style="text-align:center;"><strong>七步法</strong></td></tr><tr><td style="text-align:center;"><strong>红色字</strong></td><td style="text-align:center;"><strong>十步法</strong></td></tr></tbody></table><figure><img src="https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171712366.jpeg" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="初始化阶段" tabindex="-1"><a class="header-anchor" href="#初始化阶段"><span>初始化阶段</span></a></h3><ol><li>Bean实例进行set属性填充</li></ol><ul><li>注入普通属性，String、int或存储基本类型的集合时，直接通过set方法的反射设置进去；</li><li>注入单向对象引用属性时，从容器中getBean获取后通过set方法反射设置进去，如果容器中没有，则先创建被注入对象Bean实例（完成整个生命周期）后，在进行注入操作；</li><li>注入双向对象引用属性时，就比较复杂了，涉及了循环引用（循环依赖）问题。</li></ul><ol start="2"><li>Aware接口属性注入</li><li>BeanPostProcessor的before()方法回调</li><li>InitializingBean接口的初始化方法回调</li><li>自定义初始化方法init回调</li><li>BeanPostProcessor的after()方法回调</li></ol><h4 id="初始化阶段一览图" tabindex="-1"><a class="header-anchor" href="#初始化阶段一览图"><span>初始化阶段一览图</span></a></h4><figure><img src="https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171712104.png" alt="image.png" tabindex="0" loading="lazy"><figcaption>image.png</figcaption></figure><h5 id="aware接口" tabindex="-1"><a class="header-anchor" href="#aware接口"><span>Aware接口</span></a></h5><p>Aware是一个具有标识作用的超级接口，具体实现是由子接口去决定的，但是子接口至少要有一个带一个参数的且返回是空的方法。<br> ● 实现该接口的bean是具有被spring 容器通知的能力的，而被通知的方式就是通过回调。<br> ● 也就是说：直接或间接实现了这个接口的类，都具有被spring容器通知的能力。<br> ● 比如实现了ApplicationContextAware接口的类，能够获取到ApplicationContext，实现了BeanFactoryAware接口的类，能够获取到BeanFactory对象。<br><img src="https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171712162.png" alt="image.png" loading="lazy"></p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">AwareImpl</span> <span class="token keyword">implements</span> <span class="token class-name">ApplicationContextAware</span><span class="token punctuation">,</span> <span class="token class-name">BeanFactoryAware</span><span class="token punctuation">,</span> <span class="token class-name">BeanNameAware</span><span class="token punctuation">,</span> <span class="token class-name">BeanClassLoaderAware</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setBeanFactory</span><span class="token punctuation">(</span><span class="token class-name">BeanFactory</span> beanFactory<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;beanFactory = &quot;</span> <span class="token operator">+</span> beanFactory<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setBeanName</span><span class="token punctuation">(</span><span class="token class-name">String</span> beanName<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;beanName = &quot;</span> <span class="token operator">+</span> beanName<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setApplicationContext</span><span class="token punctuation">(</span><span class="token class-name">ApplicationContext</span> applicationContext<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;applicationContext = &quot;</span> <span class="token operator">+</span> applicationContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setBeanClassLoader</span><span class="token punctuation">(</span><span class="token class-name">ClassLoader</span> classLoader<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;classLoader = &quot;</span> <span class="token operator">+</span> classLoader<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="循环依赖" tabindex="-1"><a class="header-anchor" href="#循环依赖"><span>循环依赖</span></a></h4><h5 id="singleton-setter模式" tabindex="-1"><a class="header-anchor" href="#singleton-setter模式"><span>singleton + setter模式</span></a></h5><p>在这种模式下的循环依赖没有任何问题！<br> 该模式下Spring对Bean的管理主要分为清晰的两个阶段:</p><ul><li>第一个阶段:在Spring容器加载的时候，实例化Bean，只要其中任意一个Bean实例化之后，马上进行“曝光”【不等属性赋值就曝光】</li><li>第二个阶段:Bean”曝光&quot;”之后，再进行属性的赋值(调用set方法。)。</li></ul><p>核心解决方案是:实例化对象和对象的属性赋值分为两个阶段来完成的。<br> **注意:**只有在scope是singleton（二者任意一个）的情况下，Bean才会采取提前“曝光”的措施。</p><h5 id="singleton-构造方法" tabindex="-1"><a class="header-anchor" href="#singleton-构造方法"><span>singleton + 构造方法</span></a></h5><p>结论：有问题！<br> 对象A在使用构造方法创建时必须将另外一个引用对象赋值完成后才能结束，不能像singleton + setter模式下进行“曝光”处理。</p><h5 id="spring的解决方案" tabindex="-1"><a class="header-anchor" href="#spring的解决方案"><span>Spring的解决方案</span></a></h5><p>Spring提供了三级缓存存储 完整Bean实例 和 半成品Bean实例 ，用于解决循环引用问题</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DefaultSingletonBeanRegistry</span> <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span> <span class="token punctuation">{</span>
    <span class="token comment">//1、最终存储单例Bean成品的容器，即实例化和初始化都完成的Bean，称之为&quot;一级缓存&quot;</span>
    <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> singletonObjects <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ConcurrentHashMap</span><span class="token punctuation">(</span><span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//2、早期Bean单例池，缓存半成品对象，只实例化但未被初始化，且当前对象已经被其他对象引用了，称之为&quot;二级缓存&quot;</span>
    <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> earlySingletonObjects <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ConcurrentHashMap</span><span class="token punctuation">(</span><span class="token number">16</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//3、单例Bean的工厂池，缓存半成品对象，存储创建单例对象时所用的那个工厂对象，对象未被引用，使用时在通过工厂创建Bean，称之为&quot;三级缓存&quot;</span>
    <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">ObjectFactory</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> singletonFactories <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HashMap</span><span class="token punctuation">(</span><span class="token number">16</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>案例：UserService和UserDao的循环依赖<br> UserService 实例化对象，但尚未初始化，将UserService存储到三级缓存；<br> UserService 属性注入，需要UserDao，从缓存中获取，没有UserDao；<br> UserDao实例化对象，但尚未初始化，将UserDao存储到到三级缓存；<br> UserDao属性注入，需要UserService，从三级缓存获取UserService，UserService从三级缓存移入二级缓存；<br> UserDao执行其他生命周期过程，最终成为一个完成Bean，存储到一级缓存，删除二三级缓存；<br> UserService 注入UserDao；<br> UserService执行其他生命周期过程，最终成为一个完成Bean，存储到一级缓存，删除二三级缓存。</p>`,50),p=[o];function i(c,l){return s(),a("div",null,p)}const k=n(t,[["render",i],["__file","IOC_senior.html.vue"]]),d=JSON.parse('{"path":"/frame/spring/Spring/IOC_senior.html","title":"IOC-进阶","lang":"zh-CN","frontmatter":{"title":"IOC-进阶","shortTitle":"IOC-进阶","description":null,"date":"2024-06-16T21:24:02.000Z","categories":["Spring"],"tags":[]},"headers":[{"level":2,"title":"BeanFactory与ApplicationContext","slug":"beanfactory与applicationcontext","link":"#beanfactory与applicationcontext","children":[]},{"level":2,"title":"BeanFactory和FacotryBean","slug":"beanfactory和facotrybean","link":"#beanfactory和facotrybean","children":[]},{"level":2,"title":"Spring后处理器","slug":"spring后处理器","link":"#spring后处理器","children":[{"level":3,"title":"Bean工厂后处理器 – BeanFactoryPostProcessor","slug":"bean工厂后处理器-–-beanfactorypostprocessor","link":"#bean工厂后处理器-–-beanfactorypostprocessor","children":[]},{"level":3,"title":"Bean后处理器 – BeanPostProcessor","slug":"bean后处理器-–-beanpostprocessor","link":"#bean后处理器-–-beanpostprocessor","children":[]}]},{"level":2,"title":"Bean实例化基本流程","slug":"bean实例化基本流程","link":"#bean实例化基本流程","children":[]},{"level":2,"title":"Bean的生命周期","slug":"bean的生命周期","link":"#bean的生命周期","children":[{"level":3,"title":"生命周期一览图","slug":"生命周期一览图","link":"#生命周期一览图","children":[]},{"level":3,"title":"初始化阶段","slug":"初始化阶段","link":"#初始化阶段","children":[]}]}],"git":{"createdTime":1718621104000,"updatedTime":1739156820000,"contributors":[{"name":"Zhiyun Qin","email":"96156298+Okita1027@users.noreply.github.com","commits":2}]},"readingTime":{"minutes":8.72,"words":2617},"filePathRelative":"frame/spring/Spring/IOC_senior.md","localizedDate":"2024年6月17日"}');export{k as comp,d as data};
