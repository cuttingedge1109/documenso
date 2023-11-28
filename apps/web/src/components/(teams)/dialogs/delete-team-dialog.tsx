'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type DeleteTeamDialogProps = {
  teamId: number;
  teamName: string;
  trigger?: React.ReactNode;
};

export default function DeleteTeamDialog({ trigger, teamId, teamName }: DeleteTeamDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const deleteMessage = `delete ${teamName}`;

  const ZDeleteTeamFormSchema = z.object({
    teamName: z.literal(deleteMessage, {
      errorMap: () => ({ message: `You must enter '${deleteMessage}' to proceed` }),
    }),
  });

  const form = useForm({
    resolver: zodResolver(ZDeleteTeamFormSchema),
    defaultValues: {
      teamName: '',
    },
  });

  const { mutateAsync: deleteTeam } = trpc.team.deleteTeam.useMutation();

  const onFormSubmit = async () => {
    try {
      await deleteTeam({ teamId });

      toast({
        title: 'Success',
        description: 'Your team has been successfully deleted.',
        duration: 5000,
      });

      setOpen(false);

      router.push('/settings/teams');
    } catch (err) {
      toast({
        title: 'An unknown error occurred',
        variant: 'destructive',
        duration: 10000,
        description:
          'We encountered an unknown error while attempting to delete this team. Please try again later.',
      });
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={(value) => !form.formState.isSubmitting && setOpen(value)}>
      <DialogTrigger asChild={true}>
        {trigger ?? <Button variant="destructive">Delete team</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete team</DialogTitle>

          <DialogDescription className="mt-4">
            Are you sure? This is irreversable.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <fieldset
              className="flex h-full flex-col space-y-4"
              disabled={form.formState.isSubmitting}
            >
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm by typing <span className="text-destructive">{deleteMessage}</span>
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="space-x-4">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button type="submit" variant="destructive" loading={form.formState.isSubmitting}>
                  Delete
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
