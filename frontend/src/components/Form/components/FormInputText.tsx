import TextField, { type TextFieldProps } from '@mui/material/TextField'
import {
  Controller,
  type FieldPathByValue,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form'
import { useState } from 'react'
import { IconButton, InputAdornment } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

export type FormInputTextProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
> = Pick<TextFieldProps, 'disabled' | 'required' | 'type'> &
  Pick<UseControllerProps<TFieldValues, TName>, 'control' | 'name' | 'rules'> & {
    label?: string
  }

export const FormInputText = <
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
>({ control, disabled, label, name, required, rules, type = 'text' }: FormInputTextProps<TFieldValues, TName>) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
          <TextField
            {...field}
            type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
            required={required}
            label={label}
            fullWidth
            error={fieldState.invalid}
            helperText={fieldState.error?.message}
            disabled={disabled}
            variant="standard"
            slotProps={{
              input: {
              endAdornment: type === 'password' ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },  
            }}

            sx={{
              '& .MuiInput-underline:before': {
                borderBottomColor: '#D2E6FE',
              },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottomColor: '#2196f3',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#2196f3',
              },
            }}
          />
        )
      }
    />
  )
}