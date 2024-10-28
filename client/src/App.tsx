import './App.css';
//import { EventSourcing } from '@/components/eventSourcing';
//import {LongPolling} from "@/components/longPolling";
import { WebSockets } from '@/components/webSockets';
//import { ShortPolling } from '@/components/shortPoling';

function App() {
  return (
    <>
      {/*<ShortPolling />*/}
      {/*<LongPolling/>*/}
      {/*<EventSourcing/>*/}
      <WebSockets />
    </>
  );
}

export default App;
