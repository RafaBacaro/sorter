/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DiffEditor, Editor, useMonaco } from "@monaco-editor/react";
import { ProgressSpinner } from 'primereact/progressspinner';

const FileUploader = () => {
    let sortedFileContent: any[] = [];
    let sortedFileChild: any[] = [];
    let parentNode: any;
    const [jsonContentMain, setJsonContentMain] = useState("");
    const [jsonContentCompare, setJsonContentCompare] = useState("");
    const [loading, setLoading] = useState(false);

    const hiddenFileMainInput = useRef<HTMLInputElement>(null);
    const hiddenFileCompareInput = useRef<HTMLInputElement>(null);
    const toast = useRef(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0].type === "application/json") {
            //setFile(e.target.files[0]);
            if (e.target.files[0]) {
                try {
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        const jsonStr = e.target?.result ? e.target?.result : "";
                        //setJsonContentMain(jsonStr.toString());
                        showMessage('File was uploaded successfully', 'Success', toast, 'success');
                        handleSortContent(jsonStr.toString(), 'main');
                    };
                    reader.readAsText(e.target.files[0]);
                } catch (e: any) {
                    showMessage('Error trying to sort content', e['message'], toast, 'error');
                }
            }
        }
    };

    const handleFileChangeCompare = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0].type === "application/json") {
            if (e.target.files[0]) {
                try {
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        const jsonStr = e.target?.result ? e.target?.result : "";
                        //setJsonContentCompare(jsonStr.toString());
                        showMessage('File was uploaded successfully', 'Success', toast, 'success');
                        handleSortContent(jsonStr.toString(), '');
                    };
                    reader.readAsText(e.target.files[0]);
                } catch (e: any) {
                    showMessage('Error trying to sort content', e['message'], toast, 'error');
                }
            }
        }
    };

    const handleUploadClickMain = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!hiddenFileMainInput?.current) return;
        hiddenFileMainInput.current.click();
    }

    const handleUploadClickCompare = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!hiddenFileCompareInput?.current) return;
        hiddenFileCompareInput.current.click();
    }

    /* const sendFileToTranslate = async (fileToTranslate: any) => {
         try {
              const result = await fetch("https://", {
                  method: 'POST',
                  body: JSON.stringify({
                      q: 'Hello there little one',
                      source: 'en',
                      target: 'es'
                  }),
                  headers: { 'Content-Type': 'application/json' }
              });
  
              console.log(await result.json());
              //return await result;
          } catch (error) {
              console.error('Could not translate file due to:', error);
          }
      } */

    const handleSortContent = async (obj: string, whichJson: string) => {
        try {
            sortedFileContent = [];
            let jsonObj: any;
            jsonObj = JSON.parse(obj);

            if (jsonObj) {
                setLoading(true);
                sortObject(jsonObj).then(() => {
                    const mappedArray = mapArrayToJson(sortedFileContent);
                    if (whichJson === 'main') {
                        setJsonContentMain(JSON.stringify(mappedArray, null, 2));
                    } else {
                        setJsonContentCompare(JSON.stringify(mappedArray, null, 2));
                    }
                    setLoading(false);
                    showMessage('Content was successfully sorted', 'Success', toast, 'success');
                });
            }
        } catch (error: any) {
            setLoading(false);
            showMessage('Error trying to sort content', error['message'], toast, 'error');
        }

    };

    const mapArrayToJson = (arr: any[]) => {
        return Object.fromEntries(arr.map((item) => [item["key"], item["value"]]));
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value) {
            setJsonContentMain(value);
        }
    }

    //TODO find a API to translate or use libreTranslator
    /* const handleJsonDepthToTranslate = async (jsonObj: any, parent?: any) => {
          Object.entries(jsonObj).map(async ([key, value]) => {
              if (typeof value === 'string') {
                  if (parent) {
                      translatedFileChild.push({ key, value });
                  } else {
                      translatedFile.push({ key, value });
                  }
              } else {
                  if (parent && parent !== key) {
                      translatedFile.push({ key: parent, value: translatedFileChild });
                  }
                  translatedFileChild = [];
                  parent = key;
                  handleJsonDepthToTranslate(value, key);
              }
          });
      } */

    const sortObject = async (jsonObj: any) => {
        let keys = Object.entries(jsonObj);
        let sortedKeys = await sort(keys);
        for (let [index, [key, value]] of sortedKeys.entries()) {
            if (value && typeof value === "string" || value === '') {
                if (parentNode) {
                    sortedFileChild.push({ key, value });
                    if (parentNode !== key && sortedKeys.length === index + 1) {
                        const mappedChildArray = mapArrayToJson(sortedFileChild);
                        sortedFileContent.push({ key: parentNode, value: mappedChildArray });
                        parentNode = undefined;
                    }
                } else {
                    sortedFileContent.push({ key, value });
                }
            } else {
                sortedFileChild = [];
                parentNode = key;
                await sortObject(value);
            }
        }
    };

    const sort = async (obj: any) => {
        return obj.sort(function (k1: string, k2: string) {
            k1 = k1[0].toLowerCase();
            k2 = k2[0].toLowerCase();
            if (k1 < k2) return -1;
            if (k1 > k2) return 1;
            return 0;
        });
    };

    const showMessage = (summary: string, detail: string, ref: any, severity: any) => {

        ref.current.show({ severity: severity, summary: summary, detail: detail, life: 3000 });
    };

    const monaco = useMonaco();

    useEffect(() => {
        monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    }, [monaco, jsonContentMain, handleEditorChange]);

    return (
        <div className="flex flex-auto flex-column align-items-center w-full">
            <div>
                <div className="input-group flex flex-row align-items-center justify-content-evenly w-full">
                    <div>
                        <Button
                            label="Upload left content"
                            icon="pi pi-upload"
                            onClick={handleUploadClickMain}
                            severity="secondary"
                        />
                        <input id="file" type="file" onChange={handleFileChange}
                            style={{ display: 'none' }} ref={hiddenFileMainInput} />
                    </div>
                    {/* <div className="card flex justify-content-center">
                        <Button disabled={!jsonContentMain} raised
                            label="Sort Left content" tooltip="Content is sorted when upload! Use this to re-sort content after changes"
                            icon="pi pi-sort-alpha-up"
                            onClick={() => handleSortContent(jsonContentMain, '')}
                        />
                    </div> */}
                    <div>
                        <Button
                            label="Upload right content"
                            icon="pi pi-upload"
                            onClick={handleUploadClickCompare}
                            severity="secondary"
                        />
                        <input id="file" type="file" onChange={handleFileChangeCompare}
                            style={{ display: 'none' }} ref={hiddenFileCompareInput} />
                    </div>
                    {/* <div className="card flex justify-content-center">
                        <Button disabled={!jsonContentCompare} raised
                            label="Sort right content" tooltip="Content is sorted when upload! Use this to re-sort content after changes"
                            icon="pi pi-sort-alpha-up"
                            onClick={() => handleSortContent(jsonContentCompare, '')}
                        />
                    </div> */}
                </div>
                <div>
                    <label>
                        {loading &&
                            <div className="spinner-container">
                                <div className="div-spinner">
                                    <ProgressSpinner />
                                </div>
                            </div>
                        }
                        {/* <Editor
                            height="70vh"
                            width="120vh"
                            theme="vs-dark"
                            defaultLanguage="json"
                            defaultValue="No file uploaded"
                            value={jsonContentMain}
                            onChange={handleEditorChange}
                            options={{
                                readOnly: false,
                                wordWrap: "bounded",
                            }}
                        /> */}
                        <DiffEditor
                            height="70vh"
                            width="160vh"
                            theme="vs-dark"
                            language="json"
                            original={jsonContentMain}
                            modified={jsonContentCompare}
                            options={{
                                originalEditable: true,
                                readOnly: false
                            }}
                        />
                    </label>
                </div>
            </div>
            <Toast ref={toast} position="center" />
        </div>
    );
};

export default FileUploader;