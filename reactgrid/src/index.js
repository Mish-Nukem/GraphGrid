import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PMApp from './PM/PMApp';
import DebugApp from './Tests/DebugApp';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
let currentProject;
currentProject = 'Debug';
//currentProject = 'PM';
root.render(
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
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
