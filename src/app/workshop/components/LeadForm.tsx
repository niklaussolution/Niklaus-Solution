import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { submitLead, declineLead } from '../lib/leads';
import { trackLeadConversion } from '../lib/analytics';

interface FormValues {
  name: string;
  email: string;
  phone: string;
}

interface LeadFormProps {
  formLocation: 'hero' | 'final-cta';
  ctaText?: string;
}

type Step = 'form' | 'confirm';

const fieldClass =
  'w-full rounded-lg border border-brand-navy/15 bg-paper px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/25';

export default function LeadForm({ formLocation, ctaText = 'Reserve My Seat for ₹399' }: LeadFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  function onFormSubmit(values: FormValues) {
    setPendingValues(values);
    setError(null);
    setStep('confirm');
  }

  async function handleReadyToPay() {
    if (!pendingValues) return;
    setBusy(true);
    setError(null);
    try {
      await submitLead({ ...pendingValues, formLocation });
      trackLeadConversion(formLocation);
      navigate('/workshop/thankyoupage', { state: { name: pendingValues.name } });
    } catch {
      setError('Something went wrong on our end. Please try again in a moment.');
      setBusy(false);
    }
  }

  async function handleNotReady() {
    if (!pendingValues) return;
    setBusy(true);
    setError(null);
    try {
      await declineLead({ ...pendingValues, formLocation });
      navigate('/workshop/notreadypage', { state: { name: pendingValues.name } });
    } catch {
      setError('Something went wrong on our end. Please try again in a moment.');
      setBusy(false);
    }
  }

  if (step === 'confirm') {
    return (
      <div className="ticket w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="label-mono text-[10px] font-semibold text-brand-navy/50">Confirm Registration</span>
          <span className="label-mono text-[10px] font-semibold text-brand-orange">₹399</span>
        </div>
        <div className="px-6 pb-2 pt-4 text-center">
          <h3 className="font-display text-lg font-bold text-brand-navy">
            Are you ready to pay ₹399 for this workshop?
          </h3>
          <p className="mt-2 text-sm text-brand-navy/60">
            Clicking yes reserves your spot. Our team will contact you directly to collect payment and confirm your seat.
          </p>
        </div>
        <div className="ticket-tear -mx-px space-y-2.5 px-6 pb-6 pt-6">
          <button
            type="button"
            onClick={handleReadyToPay}
            disabled={busy}
            className="btn-sweep flex w-full items-center justify-center gap-2 rounded-lg bg-brand-orange px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-orange/30 transition hover:-translate-y-0.5 hover:bg-brand-orange-dark hover:shadow-xl hover:shadow-brand-orange/40 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Confirming your registration...
              </>
            ) : (
              'Yes, Proceed to Pay ₹399'
            )}
          </button>
          <button
            type="button"
            onClick={handleNotReady}
            disabled={busy}
            className="w-full rounded-lg border border-brand-navy/15 px-6 py-3 text-sm font-semibold text-brand-navy/70 transition hover:bg-brand-navy/5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            No, Not Right Now
          </button>
          {error && <p className="text-center text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={() => setStep('form')}
            className="w-full text-center text-xs text-brand-navy/40 hover:text-brand-navy/60"
          >
            ← Back to edit my details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="ticket w-full overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="label-mono text-[10px] font-semibold text-brand-navy/50">Admit One · Workshop Pass</span>
        <span className="label-mono text-[10px] font-semibold text-brand-orange">₹399</span>
      </div>

      <div className="space-y-3 px-6 pb-6 pt-4">
        <div>
          <input
            {...register('name', { required: 'Please enter your name' })}
            placeholder="Full Name"
            defaultValue={pendingValues?.name}
            className={fieldClass}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <input
            type="email"
            {...register('email', {
              required: 'Please enter your email',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
            placeholder="Email Address"
            defaultValue={pendingValues?.email}
            className={fieldClass}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <input
            type="tel"
            {...register('phone', {
              required: 'Please enter your phone/WhatsApp number',
              minLength: { value: 7, message: 'Enter a valid phone number' },
            })}
            placeholder="WhatsApp Number"
            defaultValue={pendingValues?.phone}
            className={fieldClass}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="ticket-tear -mx-px px-6 pb-6 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-sweep flex w-full items-center justify-center gap-2 rounded-lg bg-brand-orange px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-orange/30 transition hover:-translate-y-0.5 hover:bg-brand-orange-dark hover:shadow-xl hover:shadow-brand-orange/40 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {ctaText}
        </button>
        <p className="mt-3 text-center text-xs text-brand-navy/40">Secure registration · no spam, ever</p>
      </div>
    </form>
  );
}
