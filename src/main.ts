import { createApp } from 'vue';
import App from './App.vue';
import pinia from './store';
import router from './router';
import './assets/index.less';
const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
