import {
  map,
  fromPairs,
  equals,
  all,
  pair,
} from 'ramda';
import {
  from,
  empty,
} from 'rxjs';
import {
  takeWhile,
  expand,
  concatMap,
  scan,
} from 'rxjs/operators';
import deepmerge from 'deepmerge';
import { useSetRecoilState, useRecoilValue, RecoilState, SerializableParam } from 'recoil';
import React, { useEffect } from 'react';
import { toObservable, translateDataSourceDefinitionToFetch, uqlPaginationStretagy, DataSourceDefinition } from './dataSourceUtils';
import {getTokensArrayFromConfig, renderJson } from "./misc";


const dataSource: (dataSourceAtom:RecoilState<any>, tokenFamily: (param: SerializableParam) => RecoilState<string>) => React.FunctionComponent<{ ds: DataSourceDefinition }> = (dataSourceAtom, tokenFamily) => 
{
  // dataSource changes when token change, when config change
  return ({ ds }) => {
    const setter = useSetRecoilState(dataSourceAtom); // never change
    const { type } = ds; 
    const relatedTokensId = getTokensArrayFromConfig(ds);
    const relatedTokens = map((k)=>pair(k,useRecoilValue(tokenFamily(k))), relatedTokensId);
    const config = renderJson({
      ...ds,
      ...fromPairs(relatedTokens)
    });
    const isEmptyString = equals('');
    const isReady = !all(isEmptyString, map((v)=>v[1], relatedTokens)) || !relatedTokens.length;
    let dataSourcefn =  fetch;
    if(type === "data" || (!isReady)){
      dataSourcefn = async () => {
        const myBlob = new Blob([JSON.stringify(config.data||[])], {type : 'application/json'});
        const init = { "status" : 200 };
        return new Response(myBlob,init);
      };
    }
    const getDataSource = toObservable(dataSourcefn);
    const params = translateDataSourceDefinitionToFetch(config);
    const res$ = getDataSource(params).pipe(
      expand((res) => {
        // this hanles multipage need change to actual implementation
        if(type==="uql" && isReady){
          return uqlPaginationStretagy(getDataSource, res);
        }
        return empty();
      }),
      takeWhile((v) => !!v),
      concatMap((response:Response) => from(response.json())),
      scan((acc, value) => deepmerge(acc, value), {}),
    );
    useEffect(() => {
      const subscription = res$.subscribe(setter);
      return () => {
        return subscription && subscription.unsubscribe();
      }
    }, [ res$, setter ])
    return <div/>;
  };
};
fetch
export default dataSource;
