export interface FontFaceFeatureConfig {
    fontFamily: FontFaceConfig | FontFaceConfig[],
}

export interface FontFaceConfig {
    name: string,
    url: string,
    descriptors: FontFaceDescriptors,
}