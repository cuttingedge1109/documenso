'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { WEBAPP_BASE_URL } from '@documenso/lib/constants/app';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { DocumentData } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
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

// Todo: Teams
export type UpdateTeamDialogProps = {
  //
};

export const ZUpdateTeamFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Please enter a valid name.' }),
  url: z.string().min(1, 'Please enter a value.'), // Todo: Teams - Restrict certain symbols.
});

export type TCreateTeamFormSchema = z.infer<typeof ZUpdateTeamFormSchema>;

export default function UpdateTeamForm(_todo: UpdateTeamDialogProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(ZUpdateTeamFormSchema),
    defaultValues: {
      name: '',
      url: '',
    },
  });

  const { mutateAsync: updateTeam } = trpc.team.updateTeam.useMutation();

  const onFormSubmit = async ({ name, url }: TCreateTeamFormSchema) => {
    try {
      await updateTeam({
        name,
        url,
      });

      toast({
        title: 'Success',
        description: 'Your team has been successfully updated.',
        duration: 5000,
      });
    } catch (err) {
      const error = AppError.parseError(err);

      if (error.code === AppErrorCode.ALREADY_EXISTS) {
        form.setError('url', {
          type: 'manual',
          message: 'This URL is already in use.',
        });

        return;
      }

      toast({
        title: 'An unknown error occurred',
        variant: 'destructive',
        description:
          'We encountered an unknown error while attempting to update your team. Please try again later.',
      });
    }
  };

  const mapTextToUrl = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <fieldset className="flex h-full flex-col" disabled={form.formState.isSubmitting}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Team Name</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      {...field}
                      onChange={(event) => {
                        const oldGenericUrl = mapTextToUrl(field.value);
                        const newGenericUrl = mapTextToUrl(event.target.value);

                        const urlField = form.getValues('url');
                        if (urlField === oldGenericUrl) {
                          form.setValue('url', newGenericUrl);
                        }

                        field.onChange(event);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Team URL</FormLabel>
                  <FormControl>
                    <Input className="bg-background" {...field} />
                  </FormControl>
                  {!form.formState.errors.url && (
                    <span className="text-foreground/50 text-xs font-normal">
                      {field.value
                        ? `${WEBAPP_BASE_URL}/t/${field.value}`
                        : 'A unique URL to encapsulate your team'}
                    </span>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                // Todo: Teams
                // onClick={() => setOpen(false)}
              >
                Reset
              </Button>

              <Button type="submit" loading={form.formState.isSubmitting}>
                Update team
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
