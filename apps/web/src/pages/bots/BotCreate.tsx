import { BotForm } from '../../components/bot/BotForm';
import { useBots } from '../../hooks/useBots';

export function BotCreate() {
  const { createBot } = useBots();

  return (
    <section className="space-y-4">
      <BotForm
        busy={createBot.isPending}
        onSubmit={async (payload) => {
          await createBot.mutateAsync(payload);
        }}
      />
      {createBot.error ? <p className="text-sm text-rose-300">{createBot.error.message}</p> : null}
      {createBot.data ? <p className="text-sm text-emerald-300">Bot created: {createBot.data.bot.id}</p> : null}
    </section>
  );
}
