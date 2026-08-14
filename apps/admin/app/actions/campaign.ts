'use server';

import { createModerationLog, upsertForumCampaignSettings, type CampaignKind, type CampaignTemplate, type ForumCampaignSettingsInput } from '@basis-forum/database';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export type CampaignFormState = { error?: string; success?: string };

const campaignTemplates: CampaignTemplate[] = ['cinematic', 'swiss-grid', 'widescreen-photo'];
const campaignKinds: CampaignKind[] = ['community', 'sponsor'];
const isSafeLink = (value: string) => !value || value.startsWith('/') || /^https:\/\/.+/i.test(value);
const isSafeImageSource = (value: string) => !value || value.startsWith('/') || /^https:\/\/.+/i.test(value);

export async function saveCampaignSettings(
  _previousState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string; name?: string } | undefined;
  if (!user?.id || user.role !== 'admin') return { error: 'Only administrators can update campaign settings.' };

  const template = String(formData.get('template') || '');
  const kind = String(formData.get('kind') || '');
  const enabled = formData.get('enabled') === 'on';
  const eyebrow = String(formData.get('eyebrow') || '').trim().replace(/\s+/g, ' ');
  const title = String(formData.get('title') || '').trim().replace(/\s+/g, ' ');
  const body = String(formData.get('body') || '').trim().replace(/\s+/g, ' ');
  const actionLabel = String(formData.get('actionLabel') || '').trim().replace(/\s+/g, ' ');
  const href = String(formData.get('href') || '').trim();
  const accent = String(formData.get('accent') || '').trim();
  const imageSrc = String(formData.get('imageSrc') || '').trim();

  if (!campaignTemplates.includes(template as CampaignTemplate)) return { error: 'Choose a supported campaign template.' };
  if (!campaignKinds.includes(kind as CampaignKind)) return { error: 'Choose a valid campaign type.' };
  if (eyebrow.length < 3 || eyebrow.length > 80) return { error: 'Eyebrow text must be 3–80 characters.' };
  if (title.length < 6 || title.length > 120) return { error: 'Title must be 6–120 characters.' };
  if (body.length < 12 || body.length > 320) return { error: 'Campaign copy must be 12–320 characters.' };
  if (actionLabel.length > 40) return { error: 'Action label must be 40 characters or fewer.' };
  if (!isSafeLink(href)) return { error: 'The destination must be a site path or HTTPS URL.' };
  if (!isSafeImageSource(imageSrc)) return { error: 'The image source must be a site path or HTTPS URL.' };
  if (accent && !/^#[0-9A-Fa-f]{6}$/.test(accent)) return { error: 'Accent must be a six-digit hex color.' };
  if (actionLabel && !href) return { error: 'Provide a destination when an action label is set.' };

  const settings: ForumCampaignSettingsInput = {
    enabled,
    template: template as CampaignTemplate,
    kind: kind as CampaignKind,
    eyebrow,
    title,
    body,
    actionLabel: actionLabel || undefined,
    href: href || undefined,
    accent: accent || undefined,
    imageSrc: imageSrc || undefined,
  };

  try {
    const campaign = await upsertForumCampaignSettings(settings, user.id);
    await createModerationLog({
      moderatorId: user.id,
      targetType: 'campaign',
      targetId: campaign.id,
      action: campaign.enabled ? 'campaign_update' : 'campaign_disable',
      reason: `${user.name || 'Administrator'} updated the ${campaign.template} campaign slot.`,
    });
    revalidatePath('/');
    revalidatePath('/search');
    return { success: campaign.enabled ? 'Campaign settings saved and published.' : 'Campaign settings saved; the slot is hidden.' };
  } catch (error) {
    console.error('Campaign settings save failed:', error);
    return { error: 'Campaign settings could not be saved. Please try again.' };
  }
}
