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
		<button onClick={()=>dispatch({type:"del"})}> Delete</button>
		<button onClick={()=>dispatch({type:"upsert",config:{
      "title": "Demo1",
      "type": "viz.Line",
      "options": {
        "a": "c",
        "b": "d"
      },
      "dataSources": {
        "primary": "sample"
      }
    }})}>update</button>
		</div>
	) 
}

export default Demo;