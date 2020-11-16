import definition from './recoilStore';
import React from 'react';
import { useRecoilValue } from 'recoil';
const JsonView = (props) =>{
    const { dataSources, visualizations, forms, tokens } = definition; 
    const dss = useRecoilValue(dataSources);
    const vizs =  useRecoilValue(visualizations);
    const fms = useRecoilValue(forms);
    const tks = useRecoilValue(tokens);
    const results = {
        dataSources: dss,
        visualizations: vizs,
        forms:fms,
        tokens: tks,
    }
    return  <div>
        {
            JSON.stringify(results)
        }
    </div>
} 

export default JsonView;