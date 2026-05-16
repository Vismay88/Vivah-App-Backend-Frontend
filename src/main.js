import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Slider from 'primevue/slider';
import Rating from 'primevue/rating';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Skeleton from 'primevue/skeleton';
import Divider from 'primevue/divider';
import Chip from 'primevue/chip';
import ProgressBar from 'primevue/progressbar';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import Galleria from 'primevue/galleria';
import Carousel from 'primevue/carousel';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Breadcrumb from 'primevue/breadcrumb';
import Avatar from 'primevue/avatar';
import ConfirmDialog from 'primevue/confirmdialog';
import MultiSelect from 'primevue/multiselect';
import Calendar from 'primevue/calendar';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import SelectButton from 'primevue/selectbutton';
import DataView from 'primevue/dataview';
import Paginator from 'primevue/paginator';
import OverlayPanel from 'primevue/overlaypanel';
import Menu from 'primevue/menu';
import Sidebar from 'primevue/sidebar';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Image from 'primevue/image';
import ScrollTop from 'primevue/scrolltop';
import Knob from 'primevue/knob';

import App from './App.vue';
import router from './router';
import './assets/styles/main.css';

// PrimeIcons
import 'primeicons/primeicons.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  ripple: true,
  inputStyle: 'outlined',
});
app.use(ToastService);
app.use(ConfirmationService);

// Register directives
app.directive('tooltip', Tooltip);

// Register PrimeVue components globally
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Dropdown', Dropdown);
app.component('Slider', Slider);
app.component('Rating', Rating);
app.component('Toast', Toast);
app.component('Dialog', Dialog);
app.component('Tag', Tag);
app.component('Badge', Badge);
app.component('Skeleton', Skeleton);
app.component('Divider', Divider);
app.component('Chip', Chip);
app.component('ProgressBar', ProgressBar);
app.component('InputNumber', InputNumber);
app.component('Textarea', Textarea);
app.component('FileUpload', FileUpload);
app.component('Galleria', Galleria);
app.component('Carousel', Carousel);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('Breadcrumb', Breadcrumb);
app.component('Avatar', Avatar);
app.component('ConfirmDialog', ConfirmDialog);
app.component('MultiSelect', MultiSelect);
app.component('Calendar', Calendar);
app.component('Password', Password);
app.component('Checkbox', Checkbox);
app.component('RadioButton', RadioButton);
app.component('SelectButton', SelectButton);
app.component('DataView', DataView);
app.component('Paginator', Paginator);
app.component('OverlayPanel', OverlayPanel);
app.component('Menu', Menu);
app.component('Sidebar', Sidebar);
app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.component('Image', Image);
app.component('ScrollTop', ScrollTop);
app.component('Knob', Knob);

app.mount('#app');
