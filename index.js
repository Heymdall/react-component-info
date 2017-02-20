'use strict';

const reactDocs = require('react-docgen');
const doctrine = require('doctrine');
const camelCase = require('uppercamelcase');
const decamelize = require('decamelize');

/**
 * Convert methods description to documentation format
 *
 * @param {Array} methods Methods array from react-docgen
 * @returns {Array}
 */
function prepareMethods(methods) {
    methods = methods || [];
    return methods
        .filter(m => !!m.docblock)
        .map(m => Object.assign({}, m, {
            docblock: doctrine.parse(m.docblock)
        }))
        .filter(m => m.docblock.tags && m.docblock.tags.some(tag => tag.title === 'public'));
}

const TYPE_MAP = {
    array: 'Array',
    bool: 'Boolean',
    func: 'Function',
    number: 'Number',
    object: 'Object',
    string: 'String',
    node: 'Node',
    element: 'Element'
};

/**
 * @typedef {Object} PropDescription
 * @property {String} name Prop name
 * @property {Object} type Prop type
 * @property {String} default Default value
 * @property {Boolean} required Is property required
 * @property {String} description jsdoc property description
 */

/**
 * @typedef {Object} EnumDescription
 * @property {String} name Enum name
 * @property {Array.<String>} values Enum value
 */

/**
 * @typedef {Object} CustomTypeDescription
 * @property {String} name Type name
 * @property {Array.<PropDescription>} props Type properties
 */

/**
 * create type description form react-docgen format.
 *
 * @param {Object} type
 * @param {String} propName
 * @param {Array.<CustomTypeDescription>} customTypes
 * @param {Array.<EnumDescription>} enums
 * @returns {String|{typeName: String}}
 */
function getType(type, propName, customTypes, enums) {
    if (!type) {
        return 'Unknown';
    }
    switch (type.name) {
        case 'array':
        case 'bool':
        case 'func':
        case 'number':
        case 'object':
        case 'string':
        case 'node':
        case 'element':
            return TYPE_MAP[type.name];
        case 'instanceOf':
            return type.value;
        case 'oneOfType':
        case 'union':
            return {
                typeName: 'union',
                types: type.value.map(getType)
            };
        case 'arrayOf':
            return {
                typeName: 'array',
                innerType: getType(type.value, propName, customTypes, enums)
            };
        case 'shape':
            propName = camelCase(propName) + 'Type';
            Object.keys(type.value).forEach(key => {
                type.value[key].type = {
                    name: type.value[key].name,
                    value: type.value[key].value
                };
            });
            customTypes.push({
                name: propName,
                props: prepareProps(type.value, customTypes, enums).props
            });

            return { typeName: 'shape', name: propName };
        case 'enum':
            propName = camelCase(propName) + 'Enum';
            enums.push({
                name: propName,
                values: type.value.map(v => v.value)
            });
            return { typeName: 'enum', name: propName };
        case 'custom':
            return type.raw;
        default:
            return type.name || type.value;
    }
}

/**
 * Преобразуем объект с информацией о свойствах из формата react-docgen в формат, пригодный для создания документации.
 *
 * @param {Object} [props] Объект с информациях о свойствах компонента, полученный из react-docgen
 * @param {Array.<CustomTypeDescription>} [customTypes] Массив типов, используемых в компоненте
 * @param {Array.<EnumDescription>} [enums] Массив enum-ов, используемых в компоненте
 * @returns {{customTypes: Array.<CustomTypeDescription>, enums: Array.<EnumDescription>, props: Array.<PropDescription>}}
 */
function prepareProps(props, customTypes, enums) {
    props = props || {};
    customTypes = customTypes || [];
    enums = enums || [];
    const result = Object.keys(props)
        .map(name => {
            const prop = props[name];

            return {
                name: name,
                type: getType(prop.type, name, customTypes, enums),
                default: prop.defaultValue ? prop.defaultValue.value : undefined,
                required: prop.required,
                description: prop.description || ''
            };
        });

    return {
        customTypes: customTypes,
        enums: enums,
        props: result
    };
}

function getDocForFileContent(src, componentName) {
    const componentInfo = reactDocs.parse(src);
    const description = doctrine.parse(componentInfo.description);

    if (description.tags && description.tags.length > 0) {
        let tag = description.tags.find(tag => tag.title === 'extends');
        if (tag) {
            componentInfo.extends = {
                name: tag.name,
                source: decamelize(tag.name, '-')
            };
        }
    }

    componentInfo.name = camelCase(componentName);
    componentInfo.description = description.description;
    componentInfo.examples = description.tags.filter(tag => tag.title === 'example').map(tag => tag.description);
    componentInfo.source = componentName;
    componentInfo.methods = prepareMethods(componentInfo.methods);
    const preparedProps = prepareProps(componentInfo.props);
    componentInfo.props = preparedProps.props;
    componentInfo.enums = preparedProps.enums;
    componentInfo.types = preparedProps.customTypes.reverse();

    return componentInfo;
}

module.exports = getDocForFileContent;
