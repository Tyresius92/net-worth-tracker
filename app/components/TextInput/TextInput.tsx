import React, { useId } from "react";

import { Box } from "../Box/Box";

interface TextInputProps
  extends Pick<
    React.InputHTMLAttributes<HTMLInputElement>,
    | "required"
    | "autoFocus"
    | "autoComplete"
    | "placeholder"
    | "pattern"
    | "defaultValue"
    | "disabled"
    | "step"
  > {
  label: string;
  name: string;
  type: "text" | "email" | "password" | "number" | "url" | "date";

  errorMessage?: string;
  hintText?: string;
  step?: number;
}

const TextInputWithForwardedRef = React.forwardRef(
  (
    { label, errorMessage, hintText, ...rest }: TextInputProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ): JSX.Element => {
    const inputId = useId();
    const errorId = useId();
    const hintId = useId();

    return (
      <Box>
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          ref={ref}
          aria-describedby={`${errorId} ${hintId}`}
          aria-invalid={errorMessage ? true : undefined}
          {...rest}
        />
        {hintText ? <Box id={hintId}>{hintText}</Box> : null}
        {errorMessage ? <Box id={errorId}>{errorMessage}</Box> : null}
      </Box>
    );
  },
);
TextInputWithForwardedRef.displayName = "TextInputWithForwardedRef";

export const TextInput = Object.assign(
  TextInputWithForwardedRef,

  // HACK: in order to expose these extra components as properties on
  // `TextInput`, we need to `Object.assign` them to the return value of
  // `React.forwardRef`.
  //
  // The reason the `MyComponent.ChildComponent` pattern works elsewhere is that
  // TS _can_ automatically merge property declarations like that into the
  // type of a function, but only if:
  //
  //   - the properties are declared in the same scope as the function itself
  //   - the function is not implicitly or explicitly typed as something else
  //
  // Here, the component is being defined as an argument of `React.forwardRef`,
  // so the value we're assigning to `TextInput` is the return type of the call
  // to `React.forwardRef` (i.e. some big ugly inferred magic), and by default
  // TS will not allow us to declare new properties on that type.
  //
  // By using `Object.assign`, TS creates a new type that merges the return type
  // from `React.forwardRef` with the properties of the object, making them
  // available like other nested components in this library.
  //
  // For consistency, we also define these widgets using our typical pattern
  // below, but note that it's not strictly necessary because the call to
  // Object.assign here makes those declarations redundant.
  //
  // For more information on declaring new properties on functions, see:
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#properties-declarations-on-functions
  {
    // TODO: add icon support
  },
);
