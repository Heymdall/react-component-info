react-component-info
=======

Parse react component source and produce simple structure with all public methods and props descriptions of component.
You can use it to generate documentation for your components.

Example
-------

```js
const reactComponentInfo = require('react-component-info');
const fs = require('fs');

const src = fs.readFileSync('src.jsx', 'utf8');
const parsed = reactComponentInfo(src, 'ComponentName');
```

Source file:

```js
import { Component, PropTypes } from 'react';

/**
 * Demo Component
 */
class Amount extends Component {
    static propTypes = {
        shapeProp: PropTypes.shape({
            bar: PropTypes.number,
            innerShape: PropTypes.shape({
                buz: PropTypes.bool
            })
        }),
        arrayProp: PropTypes.arrayOf(PropTypes.string),
        enumProp: PropTypes.oneOf(['one', 'of', 'this', 'options']),
        unionProp: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        plainProp: PropTypes.string,
    };

    static defaultProps = {
        enumProp: 'one',
        plainProp: 'some value'
    };

    /**
     * @public
     * @param {number} a
     * @param {number[]} b
     * @return string
     */
    somePublicMethod(a, b) {}
}

export default Amount;
```


Output:

```json
{
    "name": "Amount",
    "description": "Demo Component",
    "source": "amount",
    "methods": [
        {
            "name": "somePublicMethod",
            "modifiers": [],
            "params": [
                {
                    "name": "a",
                    "description": null,
                    "type": {"name": "number"}
                },
                {
                    "name": "b",
                    "description": null,
                    "type": {"name": "Array"}
                }
            ],
            "returns": {"description": "string", "type": null},
            "description": null
        }
    ],
    "props": [
        {
            "name": "shapeProp",
            "type": {"typeName": "shape", "name": "ShapePropType"},
            "required": false,
            "description": ""
        },
        {
            "name": "arrayProp",
            "type": {"typeName": "array", "innerType": "String"},
            "required": false,
            "description": ""
        },
        {
            "name": "enumProp",
            "type": {"typeName": "enum", "name": "EnumPropEnum"},
            "default": "'one'",
            "required": false,
            "description": ""
        },
        {
            "name": "unionProp",
            "type": {
                "typeName": "union",
                "types": ["Function", "String"]
            },
            "required": false,
            "description": ""
        },
        {
            "name": "plainProp",
            "type": "String",
            "default": "'some value'",
            "required": false,
            "description": ""
        }
    ],
    "enums": [
        {
            "name": "EnumPropEnum",
            "values": ["'one'", "'of'", "'this'", "'options'"]
        }
    ],
    "types": [
        {
            "name": "ShapePropType",
            "props": [
                {
                    "name": "bar",
                    "type": "Number",
                    "required": false,
                    "description": ""
                },
                {
                    "name": "innerShape",
                    "type": {"typeName": "shape", "name": "InnerShapeType"},
                    "required": false,
                    "description": ""
                }
            ]
        },
        {
            "name": "InnerShapeType",
            "props": [
                {
                    "name": "buz",
                    "type": "Boolean",
                    "required": false,
                    "description": ""
                }
            ]
        }
    ]
}
```

License
-------

```
The MIT License (MIT)

Copyright (c) 2017 Vitaliy Green

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```