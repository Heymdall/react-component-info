import * as reactDocs from 'react-docgen';
import * as doctrine from 'doctrine';
import * as camelCase from 'uppercamelcase';
import * as decamelize from 'decamelize';
import {
    ComponentInfo,
    CustomTypesDescription,
    EnumDescription,
    PropDescription,
    TypeDescription
} from './types';

function getDocForFileContent(src: string, componentName: string, resolver, handlers): ComponentInfo {
    const componentInfo: ComponentInfo = reactDocs.parse(src, resolver, handlers);
    const description = doctrine.parse(componentInfo.description);
    const preparedProps = prepareProps(componentInfo.props);
    let ext;

    if (description.tags && description.tags.length > 0) {
        let tag = description.tags.find(tag => tag.title === 'extends');
        if (tag) {
            ext = {
                name: tag.name,
                source: decamelize(tag.name, '-')
            };
        }
    }

    return {
        name: camelCase(componentName),
        description: description.description,
        source: componentName,
        examples: description.tags.filter(tag => tag.title === 'example').map(tag => tag.description),
        methods: prepareMethods(componentInfo.methods),
        props: preparedProps.props,
        enums: preparedProps.enums,
        types: preparedProps.customTypes.reverse(),
        extends: ext
    };
}

/**
 * Converts react-docgen output format to documentation-ready format
 */
function prepareProps(props = {}, customTypes: CustomTypesDescription[] = [], enums: EnumDescription[] = []) {
    const result: PropDescription[] = Object.keys(props)
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

/**
 * Convert methods description to documentation format
 */
function prepareMethods(methods: any[]) {
    methods = methods || [];
    return methods
        .filter(m => !!m.docblock)
        .map(m => ({
            ...m,
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
 * Create type description form react-docgen format.
 */
function getType(type, propName: string, customTypes: CustomTypesDescription[], enums: EnumDescription[]): TypeDescription {
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
            propName = camelCase(propName.toString()) + 'Type';
            if (typeof type.value === 'string') {
                customTypes.push({
                    name: propName,
                    props: []
                });
            } else {
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
            }

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

export = getDocForFileContent;
