import React from "react";
import ReactDOM from 'react-dom';
import App from './definition';

// const Comp = React.lazy(()=>import("remote/hub/Button"));
{/* <React.Suspense fallback={<div>loading...</div>}><Comp/></React.Suspense> */}

ReactDOM.render(<App/>, document.getElementById('root'));