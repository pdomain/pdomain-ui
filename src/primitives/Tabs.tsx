import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from './cn.js';

const Tabs = TabsPrimitive.Root;

export type TabsAppearance = 'default' | 'underline';

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  appearance?: TabsAppearance;
};

const TabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ appearance = 'default', className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn('tabs', appearance === 'underline' && 'tabs--underline', className)}
      {...props}
    />
  ),
);
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
  appearance?: TabsAppearance;
};

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ appearance = 'default', className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn('tab', appearance === 'underline' && 'tab--underline', className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('tabs-content', className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
