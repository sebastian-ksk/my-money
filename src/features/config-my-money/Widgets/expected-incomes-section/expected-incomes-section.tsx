'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  loadExpectedIncomes,
  createExpectedIncome,
  updateExpectedIncome,
  deleteExpectedIncome,
  selectExpectedIncomes,
  selectConfigLoading,
  selectUserConfig,
} from '@/Redux/features/config-my-money';
import { selectUser } from '@/Redux/features/auth';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/confirm-modal';
import { formatCurrency } from '@/utils/currency';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function ExpectedIncomesSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const expectedIncomes = useAppSelector(selectExpectedIncomes);
  const loading = useAppSelector(selectConfigLoading);
  const userConfig = useAppSelector(selectUserConfig);
  const confirm = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dayOfMonth: '',
    appliesToAllMonths: true,
    selectedMonths: [] as number[],
  });

  const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  const currency = userConfig?.currency || 'COP';

  useEffect(() => {
    if (user?.uid) {
      dispatch(loadExpectedIncomes(user.uid));
    }
  }, [dispatch, user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const numericAmount =
      parseFloat(formData.amount.replace(/[^\d]/g, '')) || 0;
    // Si aplica a todos los meses: undefined (no se incluirá el campo)
    // Si hay meses seleccionados: array con los meses
    // Si no hay meses seleccionados: array vacío []
    const months = formData.appliesToAllMonths
      ? undefined
      : formData.selectedMonths;

    if (editingId) {
      await dispatch(
        updateExpectedIncome({
          incomeId: editingId,
          income: {
            name: formData.name,
            amount: numericAmount,
            dayOfMonth: parseInt(formData.dayOfMonth),
            months,
          },
        })
      );
    } else {
      await dispatch(
        createExpectedIncome({
          userId: user.uid,
          income: {
            name: formData.name,
            amount: numericAmount,
            dayOfMonth: parseInt(formData.dayOfMonth),
            months,
          },
        })
      );
    }

    setFormData({
      name: '',
      amount: '',
      dayOfMonth: '',
      appliesToAllMonths: true,
      selectedMonths: [],
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (income: {
    id?: string;
    name: string;
    amount: number;
    dayOfMonth: number;
    months?: number[];
  }) => {
    if (income.id) {
      setEditingId(income.id);
      setFormData({
        name: income.name,
        amount: income.amount.toString(),
        dayOfMonth: income.dayOfMonth.toString(),
        appliesToAllMonths: !income.months || income.months.length === 0,
        selectedMonths: income.months || [],
      });
      setShowModal(true);
    }
  };

  const handleDelete = async (incomeId: string) => {
    const confirmed = await confirm.showConfirm({
      title: 'Eliminar Ingreso Esperado',
      message: '¿Está seguro de eliminar este ingreso esperado?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    await dispatch(deleteExpectedIncome(incomeId));
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
      dayOfMonth: '',
      appliesToAllMonths: true,
      selectedMonths: [],
    });
    setEditingId(null);
    setShowModal(false);
  };

  const totalIncomes = expectedIncomes.reduce(
    (sum, income) => sum + income.amount,
    0
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-xl font-semibold mb-2'>Ingresos Esperados</h3>
          <p className='text-muted-foreground'>
            Salarios y otros ingresos que esperas recibir regularmente.
          </p>
        </div>
        <Button variant='income' onClick={() => setShowModal(true)}>
          <Plus className='w-4 h-4 mr-2' />
          Agregar
        </Button>
      </div>

      {expectedIncomes.length === 0 ? (
        <div className='text-center py-12 text-muted-foreground'>
          <p>No hay ingresos esperados configurados</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {expectedIncomes.map((income) => (
            <div
              key={income.id}
              className='flex items-center gap-4 p-4 rounded-xl bg-muted/50 group hover:bg-muted transition-colors'
            >
              <div className='flex-1'>
                <p className='font-medium'>{income.name}</p>
                <div className='flex items-center gap-2 text-sm text-muted-foreground flex-wrap'>
                  <span>{formatCurrency(income.amount, currency)}</span>
                  <span>•</span>
                  <span>Día {income.dayOfMonth}</span>
                  {income.months && income.months.length > 0 && (
                    <>
                      <span>•</span>
                      <span className='text-xs'>
                        {income.months
                          .sort((a, b) => a - b)
                          .map((m) => monthNames[m - 1])
                          .join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleEdit(income)}
                >
                  <Edit2 className='w-4 h-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => income.id && handleDelete(income.id)}
                >
                  <Trash2 className='w-4 h-4 text-destructive' />
                </Button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className='flex items-center justify-between p-4 rounded-xl bg-income/10 border border-income/20'>
            <span className='font-semibold'>Total Ingresos Esperados</span>
            <span className='font-bold text-lg text-income'>
              {formatCurrency(totalIncomes, currency)}
            </span>
          </div>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto'>
            <h4 className='text-xl font-bold mb-4'>
              {editingId ? 'Editar Ingreso Esperado' : 'Nuevo Ingreso Esperado'}
            </h4>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Nombre *</label>
                <input
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  placeholder='Ej: Salario'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Día del Mes *</label>
                  <input
                    type='number'
                    min='1'
                    max='31'
                    required
                    value={formData.dayOfMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, dayOfMonth: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                    placeholder='Ej: 25'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Monto *</label>
                  <input
                    type='text'
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      setFormData({ ...formData, amount: rawValue });
                    }}
                    onBlur={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      if (rawValue) {
                        const num = parseFloat(rawValue);
                        if (!isNaN(num) && num > 0) {
                          setFormData({
                            ...formData,
                            amount: formatCurrency(num, currency),
                          });
                        }
                      }
                    }}
                    className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                    placeholder='Ej: 110000'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Meses Aplicables</label>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={formData.appliesToAllMonths}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        appliesToAllMonths: e.target.checked,
                        selectedMonths: e.target.checked
                          ? []
                          : formData.selectedMonths,
                      });
                    }}
                    className='w-4 h-4 rounded'
                  />
                  <span className='text-sm'>Aplica a todos los meses</span>
                </label>

                {!formData.appliesToAllMonths && (
                  <div className='border border-input rounded-lg p-3 bg-muted/50'>
                    <p className='text-xs text-muted-foreground mb-2'>
                      Selecciona los meses específicos:
                    </p>
                    <div className='grid grid-cols-4 sm:grid-cols-6 gap-2'>
                      {monthNames.map((month, index) => {
                        const monthNumber = index + 1;
                        return (
                          <label
                            key={monthNumber}
                            className='flex items-center gap-1 cursor-pointer'
                          >
                            <input
                              type='checkbox'
                              checked={formData.selectedMonths.includes(
                                monthNumber
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    selectedMonths: [
                                      ...formData.selectedMonths,
                                      monthNumber,
                                    ],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedMonths:
                                      formData.selectedMonths.filter(
                                        (m) => m !== monthNumber
                                      ),
                                  });
                                }
                              }}
                              className='w-4 h-4 rounded'
                            />
                            <span className='text-xs'>{month}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className='flex gap-3 pt-2'>
                <Button
                  type='button'
                  onClick={handleCancel}
                  variant='outline'
                  className='flex-1'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  variant='income'
                  className='flex-1'
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
