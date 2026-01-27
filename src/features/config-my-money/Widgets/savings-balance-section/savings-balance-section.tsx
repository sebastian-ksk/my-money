'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  loadSavingsSources,
  createSavingsSource,
  updateSavingsSource,
  deleteSavingsSource,
  selectSavingsSources,
  selectConfigLoading,
  selectUserConfig,
} from '@/Redux/features/config-my-money';
import { selectUser } from '@/Redux/features/auth';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/confirm-modal';
import { formatCurrency } from '@/utils/currency';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function SavingsBalanceSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const savingsSources = useAppSelector(selectSavingsSources);
  const loading = useAppSelector(selectConfigLoading);
  const userConfig = useAppSelector(selectUserConfig);
  const confirm = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
  });

  const currency = userConfig?.currency || 'COP';

  useEffect(() => {
    if (user?.uid) {
      dispatch(loadSavingsSources(user.uid));
    }
  }, [dispatch, user?.uid]);

  const totalSavings = savingsSources.reduce(
    (sum, source) => sum + source.amount,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const numericAmount = parseFloat(formData.amount.replace(/[^\d]/g, '')) || 0;

    if (editingId) {
      await dispatch(
        updateSavingsSource({
          sourceId: editingId,
          source: {
            name: formData.name,
            amount: numericAmount,
          },
        })
      );
    } else {
      await dispatch(
        createSavingsSource({
          userId: user.uid,
          source: {
            name: formData.name,
            amount: numericAmount,
            currentBalance: numericAmount, // El balance inicial es igual al amount
          },
        })
      );
    }

    setFormData({
      name: '',
      amount: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (source: {
    id?: string;
    name: string;
    amount: number;
  }) => {
    if (source.id) {
      setEditingId(source.id);
      setFormData({
        name: source.name,
        amount: source.amount.toString(),
      });
      setShowModal(true);
    }
  };

  const handleDelete = async (sourceId: string) => {
    const confirmed = await confirm.showConfirm({
      title: 'Eliminar Fuente de Ahorro',
      message: '¿Está seguro de eliminar esta fuente de ahorro?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    await dispatch(deleteSavingsSource(sourceId));
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-xl font-semibold mb-2'>Fuentes de Ahorro</h3>
          <p className='text-muted-foreground'>
            Registra las cuentas donde guardas tus ahorros.
          </p>
        </div>
        <Button variant='savings' onClick={() => setShowModal(true)}>
          <Plus className='w-4 h-4 mr-2' />
          Agregar
        </Button>
      </div>

      {savingsSources.length === 0 ? (
        <div className='text-center py-12 text-muted-foreground'>
          <p>No hay fuentes de ahorro configuradas</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {savingsSources.map((source) => (
            <div
              key={source.id}
              className='flex items-center gap-4 p-4 rounded-xl bg-muted/50 group hover:bg-muted transition-colors'
            >
              <div className='flex-1'>
                <p className='font-medium'>{source.name}</p>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span>{formatCurrency(source.amount, currency)}</span>
                </div>
              </div>
              <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleEdit(source)}
                >
                  <Edit2 className='w-4 h-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => source.id && handleDelete(source.id)}
                >
                  <Trash2 className='w-4 h-4 text-destructive' />
                </Button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className='flex items-center justify-between p-4 rounded-xl bg-savings/10 border border-savings/20'>
            <span className='font-semibold'>Total en Ahorros</span>
            <span className='font-bold text-lg text-savings'>
              {formatCurrency(totalSavings, currency)}
            </span>
          </div>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl'>
            <h4 className='text-xl font-bold mb-4'>
              {editingId ? 'Editar Fuente' : 'Nueva Fuente de Ahorro'}
            </h4>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  Nombre de la Fuente *
                </label>
                <input
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  placeholder='Ej: Cuenta de Ahorro, Fondo de Emergencia, etc.'
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
                  variant='savings'
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
