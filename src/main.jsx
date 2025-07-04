//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
//import App from './App.jsx'
import PMApp from './PM/PMApp';
import DebugApp from './Tests/DebugApp';

let currentProject;
currentProject = 'Debug';
currentProject = 'PM';

createRoot(document.getElementById('root')).render(
    <>
        {currentProject === 'Debug' ?
            <DebugApp />
            :
            currentProject === 'PM' ?
                <PMApp />
                :
                <DebugApp />
        }
    </>
)
