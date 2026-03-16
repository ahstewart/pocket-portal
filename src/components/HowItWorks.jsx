import { CloudArrowUpIcon, PlusCircleIcon, CpuChipIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    icon: CloudArrowUpIcon,
    color: 'bg-blue-100 text-blue-600',
    title: 'Source a Model',
    description: 'Start with any TFLite model on Hugging Face or upload one directly from your machine.',
  },
  {
    icon: PlusCircleIcon,
    color: 'bg-primary-100 text-primary-600',
    title: 'Add it to Jacana',
    description: 'Create a model listing and add a version — Jacana stores the metadata and tracks your assets.',
  },
  {
    icon: CpuChipIcon,
    color: 'bg-teal-100 text-teal-600',
    title: 'Generate a Pipeline',
    description: 'Jacana inspects the model and generates a preprocessing and postprocessing pipeline automatically.',
  },
  {
    icon: DevicePhoneMobileIcon,
    color: 'bg-secondary-100 text-secondary-600',
    title: 'Run it on Mobile',
    description: 'Users download and run the model 100% on-device — no internet required after download.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-center">
          How It Works
        </h2>
        <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
          From a model file to running AI on a phone in four steps.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative flex flex-col items-center text-center">
                {/* Connector line (hidden on last item) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-slate-200" />
                )}

                {/* Icon circle */}
                <div className={`relative z-10 h-14 w-14 rounded-full flex items-center justify-center mb-4 ${step.color}`}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Step number */}
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Step {i + 1}
                </span>

                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
