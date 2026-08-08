export interface FontFaceFeatureConfig {
    fontFamilies: FontFaceConfig | FontFaceConfig[],
}

export interface FontFaceConfig {
    name: string,
    url: string,
    descriptors: FontFaceDescriptors,
}