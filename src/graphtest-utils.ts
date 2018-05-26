export function makeGraphTestItems(items): GraphTestItem[] {
    return items.map(item => ({
        key: item.key,
        clazz: item.clazz,
        gElt: null,
        show: true,
    }))
}

export interface GraphTestItem {
    key: string;
    clazz: string;
    gElt: Element;
    show: boolean;
}