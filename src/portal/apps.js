import Calendar from '../components/Calendar.vue'
import ToDoList from '../components/ToDoList.vue'
import Weather from '../components/Weather.vue'
import PortalMusic from '../components/portal/PortalMusic.vue'

// A single instance of each registered application belongs to the workspace.
export const portalApps = [
  {
    id: 'todo',
    label: 'Reminders',
    title: 'TODO List',
    icon: '/portal-icons/reminders.svg',
    component: ToDoList,
    windowClass: 'window-todo',
    shellClass: 'widget-shell todo-shell',
    defaultSize: { width: 600, height: 480 },
    minSize: { width: 340, height: 320 },
  },
  {
    id: 'music',
    label: 'Music',
    title: 'Music',
    icon: '/portal-icons/music.svg',
    component: PortalMusic,
    windowClass: 'window-music',
    shellClass: 'music-app',
    defaultSize: { width: 700, height: 420 },
    minSize: { width: 420, height: 280 },
    props: ({ musicTracks, loadingData }) => ({ tracks: musicTracks, loading: loadingData }),
  },
  {
    id: 'weather',
    label: 'Weather',
    title: 'Weather',
    icon: '/portal-icons/weather.svg',
    component: Weather,
    windowClass: 'window-weather',
    shellClass: 'widget-shell weather-shell',
    defaultSize: { width: 720, height: 640 },
    minSize: { width: 320, height: 320 },
  },
  {
    id: 'calendar',
    label: 'Calendar',
    title: 'Calendar',
    icon: '/portal-icons/calendar.svg',
    component: Calendar,
    windowClass: 'window-calendar',
    shellClass: 'widget-shell calendar-shell',
    defaultSize: { width: 490, height: 488 },
    minSize: { width: 320, height: 300 },
  },
]
