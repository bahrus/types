export interface EndUserProps {
    for: string;
}

export interface AllProps extends EndUserProps {

}

export type PAP = Partial<AllProps>;

export type ProPAP = Promise<PAP>;

export interface Actions{
    hydrate(self: AllProps): void;
}