
export var printStuff = false;

export function print(...args: any[]) {
    if (printStuff) {
        console.info.apply(console, args);
    }
};

export function equals(property: string, obj1: any, obj2: any) {
    let p1 = obj1[property];
    let p2 = obj2[property];
    let result = _equals(p1, p2);
    if (!result) {
        print(property, "differs:", p1, p2);
    }
    return result;
};

function _equals(p1: any, p2: any) {
    if (p1 == null || p2 == null) {
        // i think the trimmer is turning null into ""
        p1 = p1 || "";
        p2 = p2 || "";
    }

    // number models get bound as strings (by aurelia?) sometimes, so strict equality no work here
    let result = p1 == p2;

    if (p1 instanceof Date && p2 instanceof Date) {
        result = p1.getTime() === p2.getTime();
    } else if ((p1 instanceof Date) || p2 instanceof Date) {
        result = false;
    }
    if (!result) {
        if (p1 instanceof Date) {
            print(p1.getTime());
        }
        if (p2 instanceof Date) {
            print(p2.getTime());
        }
    }
    return result;
};
