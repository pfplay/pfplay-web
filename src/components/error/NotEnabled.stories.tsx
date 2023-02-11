import { ComponentMeta, ComponentStory } from '@storybook/react'

import NotEnabled from './NotEnabled'

export default {
  title: 'Error/NotEnabled',
  component: NotEnabled,
} as ComponentMeta<typeof NotEnabled>

const Template: ComponentStory<typeof NotEnabled> = () => <NotEnabled />

export const Default = Template.bind({})
Default.storyName = 'NotEnabled'
