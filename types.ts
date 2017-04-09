export interface ComponentInfo {
    name: string;
    description: string;
    source: string;
    methods: MethodDescription[];
    props: PropDescription[];
    examples: string[];
    enums: EnumDescription[];
    types: CustomTypesDescription[];
    extends?: { name: string; source: string; };
}

export interface UnionTypeDescription {
    typeName: 'union';
    types: TypeDescription[];
}

export interface ArrayTypeDescription {
    typeName: 'array';
    innerType: TypeDescription;
}

export interface ShapeTypeDescription {
    typeName: 'shape';
    name: string;
}

export interface EnumTypeDescription {
    typeName: 'enum';
    name: string;
}

export type TypeDescription = string
    | EnumTypeDescription
    | ShapeTypeDescription
    | ArrayTypeDescription
    | UnionTypeDescription;

export interface PropDescription {
    name: string;
    type: TypeDescription;
    default: string;
    required: boolean;
    description: string; // jsdoc property description
}

export interface EnumDescription {
    name: string;
    values: string[];
}

export interface CustomTypesDescription {
    name: string;
    props: PropDescription[];
}

export interface MethodParamDescription {
    name: string;
    description: string;
    type: { name: string; type: string; };
}

export interface MethodDescription {
    name: string;
    description: string;
    params: MethodParamDescription[];
    returns: {
        description: string;
        type: { name: string; type: string; };
    };
}