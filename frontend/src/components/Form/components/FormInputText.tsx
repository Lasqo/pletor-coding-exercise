import TextField, { type TextFieldProps } from '@mui/material/TextField'
import {
  Controller,
  type FieldPathByValue,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form'


export type FormInputTextProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
> = Pick<TextFieldProps,  'disabled'  |'required'> &
  Pick<UseControllerProps<TFieldValues, TName>, 'control' | 'name' | 'rules'> & {
    label?: string
  }

export const  FormInputText= <
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
> ({ control, disabled,label, name,required,rules }: FormInputTextProps<TFieldValues, TName>) => {
  return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field,fieldState:{error,invalid} }) => (
          <TextField
            {...field}
            required={required}
            label={label}
            fullWidth
            error={invalid}
            helperText={error?.message}
            disabled={disabled}
            variant="standard"
              sx={{
            '& .MuiInput-underline:before': {
              borderBottomColor: '#D2E6FE', // Default line color
            },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              borderBottomColor: '#2196f3', // Hover color
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: '#2196f3', // Focused color
            },
          }}
          />
        )}
      />
  )
}
