/**
 * Accordion — Radix-based implementation.
 *
 * Design choice: using @radix-ui/react-accordion (not native <details>) for
 * consistent keyboard navigation, animation hooks, and ARIA attributes across
 * the suite. All pdomain-ui Radix wrappers are styling + slot layers only.
 */
import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from './cn.js';

const Accordion = AccordionPrimitive.Root;

export type AccordionTone = 'default' | 'accent' | 'danger';

type AccordionItemProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
  tone?: AccordionTone;
};

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, tone = 'default', ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('acc', tone !== 'default' ? tone : undefined, className)}
    {...props}
  />
));
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="acc-head">
    <AccordionPrimitive.Trigger ref={ref} className={cn('acc-trigger', className)} {...props}>
      {children}
      <span className="chev" aria-hidden>
        &#8250;
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className={cn('acc-body', className)} {...props}>
    {children}
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
