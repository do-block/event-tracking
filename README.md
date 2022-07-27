# 埋点库

简易埋点库。 自动化收集的第一步,通过简单的配置和传参实现。

- 访问量埋点
- 点击埋点

## 使用

###  基础使用


####  Vue
```typescript
// main.ts
import  tracking from 'event-tracking'
app.use(tracking)
```


#### 自动上报

- 对需要监听点击事件的添加 data-seed="key" 属性

key 对应的值有：
- `click`: 点击事件
- ~~`focus`: 聚焦事件~~
- ~~`blur`: 失焦事件~~
- ~~`input`: 输入事件~~

所有的 `data-aext-` 都将会被解析成对象，具体的配置参数请参考下面的配置参数。

```typescript
import { EventCode } from "./eventCode";
import { PageCode } from "./pageCode";

const logProps = {
  'data-seed': 'click',
  'data-aext-API_URL': 'https://xxx.com/event',
  'data-aext-PAGE_CODE': PageCode.HOME,
  'data-aext-EVENT_CODE': EventCode.LEAVE,
}
```

#### 手动上报
```typescript
// index.vue
import { useTracking } from "./index";
const log = useTracking()

const onClick = () => {
  log({
    EVENT_CODE: EventCode.CLICK_LOCATION,
    API_URL: 'https://xxx.com/event',
    PAGE_CODE: PageCode.HOME,
  })
}

```

#### 自动进行页面加载和离开上报

```typescript
// index.vue
import { useTracking } from "./index";

useTracking({
  enable: true,
  PageCode: PageCode.HOME,
})
```


#### vue路由自动上报
- 使用  
 将tracking插件在router后面进行use使用
 
```typescript
// main.ts
app.use(router).use(
    createTracking({
      imgSrc: trackingUrl,
      baseOption: {},
    })
  )
```

#### JS
```HTML
下载文件，放到项目中
```

## 备注
目前支持点击和聚焦输入等事件的自动收集，后续会支持更多的事件类型。

更多开发中功能....

