"use client";

import * as React from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";

type FormProps = {
  children: React.ReactNode;
} & React.ComponentProps<typeof FormProvider>;

export const Form = ({ children, ...props }: FormProps) => {
  return <FormProvider {...props}>{children}</FormProvider>;
};

type FormFieldContextValue = {
  name: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

type FormFieldProps = {
  name: string;
  control: any;
  render: (props: any) => React.ReactNode;
};

export const FormField = ({ name, control, render }: FormFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={(props) => (
        <FormFieldContext.Provider value={{ name }}>{render(props)}</FormFieldContext.Provider>
      )}
    />
  );
};

const FormItemContext = React.createContext<{ id: string } | null>(null);

export const FormItem = ({ children }: { children: React.ReactNode }) => {
  const id = React.useId();
  return <FormItemContext.Provider value={{ id }}><div className="space-y-2">{children}</div></FormItemContext.Provider>;
};

export const FormLabel = ({ children }: { children: React.ReactNode }) => {
  return <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{children}</label>;
};

export const FormControl = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const FormMessage = () => {
  const field = React.useContext(FormFieldContext);
  const { formState } = useFormContext();
  if (!field) return null;
  const error = (formState.errors as Record<string, any>)[field.name];
  if (!error?.message) return null;
  return <p className="text-sm text-red-600">{String(error.message)}</p>;
};
