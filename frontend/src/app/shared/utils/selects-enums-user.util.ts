
export function enumToOptions(enumObj: any, labelsObj?: Record<string, string>) {
  return Object.values(enumObj).map(value => ({
    label: labelsObj ? labelsObj[value as string] : String(value),
    value: value
  }));
}