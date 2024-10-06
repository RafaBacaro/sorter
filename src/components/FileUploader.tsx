/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Editor, useMonaco } from "@monaco-editor/react";

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  let sortedFileContent: any[] = [];
  let sortedFileChild: any[] = [];
  const [jsonContent, setJsonContent] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0].type === "application/json") {
      setFile(e.target.files[0]);
    }
  };

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

  const handleUpload = async () => {
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async function (e) {
          const jsonStr = e.target?.result ? e.target?.result?.toString() : "";
          const jsonObj = JSON.parse(jsonStr);
          sortedFileContent = [];

          if (jsonObj) {
            sortObject(jsonObj).then(() => {
                //TODO make a re-sort file possible
                //TODO make a sort from the editor, without uploaded file
              const mappedArray = mapArrayToJson(sortedFileContent);
              setJsonContent(JSON.stringify(mappedArray, null, 2));
            });
          }
        };
        reader.readAsText(file);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const mapArrayToJson = (arr: any[]) => {
    return Object.fromEntries(arr.map((item) => [item["key"], item["value"]]));
  };

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

  const sortObject = async (jsonObj: any, parent?: any) => {
    let keys = Object.entries(jsonObj);
    let sortedKeys = await sort(keys);
    for (let [index, [key, value]] of sortedKeys.entries()) {
      if (value && typeof value === "string") {
        if (parent) {
          sortedFileChild.push({ key, value });
          if (parent !== key && sortedKeys.length === index + 1) {
            const mappedChildArray = mapArrayToJson(sortedFileChild);
            sortedFileContent.push({ key: parent, value: mappedChildArray });
          }
        } else {
          sortedFileContent.push({ key, value });
        }
      } else {
        sortedFileChild = [];
        parent = key;
        await sortObject(value, key);
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

  const monaco = useMonaco();

  useEffect(() => {
    monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    if (monaco) {
    }
  }, [monaco]);

  return (
    <>
      <div className="flex flex-auto flex-column align-items-center w-full">
        <div className="input-group">
          <input id="file" type="file" onChange={handleFileChange} />
        </div>
        {/* {file && (
                    <section>
                        File details:
                        <ul>
                            <li>Name: {file.name}</li>
                            <li>Type: {file.type}</li>
                            <li>Size: {file.size} bytes</li>
                        </ul>
                    </section>
                )} */}
        {file && (
          <div className="card flex justify-content-center">
            <Button
              label="Sort file"
              icon="pi pi-upload"
              onClick={handleUpload}
            />
          </div>
        )}

        <label>
          Sorted Json file:
          <Editor
            height="60vh"
            width="100vh"
            defaultLanguage="JSON"
            defaultValue="// No file uploaded"
            value={jsonContent}
            options={{
              readOnly: false,
              wordWrap: "bounded",
            }}
          />
        </label>
      </div>
    </>
  );
};

export default FileUploader;
