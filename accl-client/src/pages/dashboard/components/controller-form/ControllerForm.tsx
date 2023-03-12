import React, { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { faAdd, faRemove } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material'
import { cloneDeep, isEqual } from 'lodash'

import { Chart } from '../chart'

import { StyledControllerForm, TooltipContent } from './ControllerForm.styled'

type Form = {
  newTime: string | undefined
  newCurrent: string | undefined
  controlPoints: { time: number; current: number }[]
}

export const ControllerForm: React.FC = () => {
  const {
    control,
    formState: { errors: formErrors },
    resetField,
    setFocus,
    getValues,
    setValue,
    watch,
    register,
    setError,
    clearErrors,
  } = useForm<Form>({
    defaultValues: {
      controlPoints: [
        { time: 0, current: 0 },
        { time: Infinity, current: 0 },
      ],
    },
  })
  const {
    fields: controlPoints,
    append: appendControlPoint,
    remove: removeControlPoint,
    update: updateControlPoint,
  } = useFieldArray({
    name: 'controlPoints',
    control,
  })
  const controlPointsWatcher = watch('controlPoints')

  useEffect(() => {
    const points = getValues('controlPoints')
    const newPoints = cloneDeep(points).sort((p1, p2) => p1.time - p2.time)

    console.log(newPoints.at(-1).current, newPoints.at(-2).current)
    if (newPoints.at(-1).time !== Infinity)
      newPoints.push({ time: Infinity, current: 0 })
    newPoints.at(-1).current = newPoints.at(-2).current

    if (!isEqual(points, newPoints)) setValue('controlPoints', newPoints)
  }, [controlPointsWatcher])

  const addNewControlPoint = () => {
    clearErrors()

    const time = getValues('newTime')
    const current = getValues('newCurrent')

    const errorOptions = {
      error: { message: 'Campo obrigatório', type: 'required' },
      options: { shouldFocus: true },
    }
    if (!time) {
      setError(
        'newTime',
        { ...errorOptions.error, message: 'Defina o tempo em segundos' },
        errorOptions.options,
      )
      return
    }
    if (!current) {
      setError(
        'newCurrent',
        {
          ...errorOptions.error,
          message: 'Defina a corrente que a carga deve manter',
        },
        errorOptions.options,
      )
      return
    }

    const indexOfExitingPoint = getValues('controlPoints').findIndex(
      point => point.time.toString() === time.toString(),
    )

    if (indexOfExitingPoint !== -1)
      updateControlPoint(indexOfExitingPoint, {
        time: +time,
        current: +current,
      })
    else appendControlPoint({ time: +time, current: +current })

    resetField('newTime')
    resetField('newCurrent')
    setFocus('newTime')
  }

  const handleFieldKeyDown = ({ key }) => {
    if (key === 'Enter') addNewControlPoint()
  }

  return (
    <StyledControllerForm>
      <section className="plot">
        <Chart data={controlPoints} />
      </section>
      <section className="form">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Points">
            <TableHead>
              <TableRow>
                <TableCell>Tempo (s)</TableCell>
                <TableCell>Corrente (A)</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow key="addRow">
                <TableCell className="align-top">
                  <Tooltip
                    title={
                      <>
                        <h3>
                          <b>Insira o tempo em segundos.</b>
                        </h3>
                        <h4>
                          É possível editar um ponto inserindo outro com o mesmo
                          valor de tempo.
                        </h4>
                      </>
                    }
                    enterDelay={1000}
                    placement="top"
                    arrow
                  >
                    <TextField
                      type="number"
                      onKeyDown={handleFieldKeyDown}
                      error={!!formErrors?.newTime}
                      helperText={formErrors?.newTime?.message}
                      {...register('newTime')}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell className="align-top">
                  <Tooltip
                    title={
                      <>
                        <h3>
                          <b>Insira a corrente esperada em amperes.</b>
                        </h3>
                      </>
                    }
                    enterDelay={1000}
                    placement="top"
                    arrow
                  >
                    <TextField
                      type="number"
                      onKeyDown={handleFieldKeyDown}
                      error={!!formErrors?.newCurrent}
                      helperText={formErrors?.newCurrent?.message}
                      {...register('newCurrent')}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip
                    title={
                      <>
                        <h3>
                          <b>Adicionar ponto à rotina</b>
                        </h3>
                      </>
                    }
                    enterDelay={1000}
                    placement="top"
                    arrow
                  >
                    <IconButton onClick={addNewControlPoint}>
                      <FontAwesomeIcon icon={faAdd} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>

              {controlPoints.slice(0, -1).map(({ time, current }, index) => (
                <TableRow key={time}>
                  <TableCell>{time}</TableCell>
                  <TableCell>{current}</TableCell>
                  <TableCell align="right">
                    {time === 0 ? null : (
                      <IconButton onClick={() => removeControlPoint(index)}>
                        <FontAwesomeIcon icon={faRemove} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </StyledControllerForm>
  )
}
