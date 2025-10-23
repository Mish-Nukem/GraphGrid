//import { StrictMode } from 'react'
import './Grid/css/default.css';
import { BaseComponent } from './Grid/Base';
import { createRoot } from 'react-dom/client'
import PMApp from './PM/PMApp';
import MRApp from './MR/MRApp';
import DebugApp from './Tests/DebugApp';
import { GLObject } from './Grid/GLObject';

//GLObject.isDebug = true;

GLObject.projectID = 'Debug';
GLObject.projectID = 'PM';
//GLObject.projectID = 'MR';

createRoot(document.getElementById('root')).render(
    <>
        {GLObject.projectID === 'Debug' ?
            <DebugApp />
            :
            GLObject.projectID === 'PM' ?
                <PMApp />
                :
                GLObject.projectID === 'MR' ?
                    <MRApp />
                    :
                <DebugApp />
        }
    </>
)
