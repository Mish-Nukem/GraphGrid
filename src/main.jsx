//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PMApp from './PM/PMApp';
import MRApp from './MR/MRApp';
import DebugApp from './Tests/DebugApp';

let currentProject;
currentProject = 'Debug';
currentProject = 'PM';
currentProject = 'MR';

createRoot(document.getElementById('root')).render(
    <>
        {currentProject === 'Debug' ?
            <DebugApp />
            :
            currentProject === 'PM' ?
                <PMApp />
                :
                currentProject === 'MR' ?
                    <MRApp />
                    :
                <DebugApp />
        }
    </>
)
