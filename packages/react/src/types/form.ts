export type FilterFormProps<T extends React.ElementType> = React.ComponentProps<T> & {
    component?: T;
    disabled?: boolean;
} & (
        | {
              storage: Storage;
              storageKey: string;
          }
        | {
              storage?: undefined;
              storageKey?: undefined;
          }
    );
