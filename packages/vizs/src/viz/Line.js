import React, {useEffect, useState}from 'react';
import { Chart, LineAdvance } from 'bizcharts';

function Demo( {primary, config, dispatch, name} ) {
	return(
		<div>
			<div>{config.title}</div>
			<Chart padding={[10, 20, 50, 40]} autoFit height={300} data={primary} >
		<LineAdvance
			shape="smooth"
			point
			area
			position="month*temperature"
			color="city"
		/>
	</Chart>v
		<button onClick={()=>dispatch({type:"del", name})}> Delete</button>
		<button onClick={()=>dispatch({type:"upsert",name:"table4",config:{
      "title": "Demo",
      "type": "viz.Line",
      "options": {
        "a": "c",
        "b": "d"
      },
      "dataSources": {
        "primary": "sample"
      }
    }})}>add</button>
		</div>
	) 
}

export default Demo;