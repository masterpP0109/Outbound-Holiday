import { z } from 'zod';
import { DetailedAccommodationSchema, ExperienceSchema, DetailedPackageSchema, GuideArticleSchema, ActivityItemSchema } from './generated-content-schema';
export const PackageStaySchema = DetailedPackageSchema.shape.recommendedHotels.element.extend({originalId:z.string(),packageId:z.string()});
export const StayTierSchema = z.object({id:z.string(),name:z.string(),tagline:z.string(),pricePerNightUSD:z.number().nonnegative(),imageUrl:z.string(),desc:z.string(),highlights:z.array(z.string())}).strict();
export const MediaSchema = z.object({id:z.string(),url:z.string(),alt:z.string(),caption:z.string().nullable(),displayOrder:z.number().int(),role:z.string()}).strict();
export const AlbumSchema = z.object({id:z.string(),slug:z.string(),title:z.string(),featured:z.boolean(),images:z.array(MediaSchema)}).strict();
const JsonSchema:z.ZodType<PrismaJson>=z.lazy(()=>z.union([z.string(),z.number().finite(),z.boolean(),z.null(),z.array(JsonSchema),z.record(JsonSchema)]));
type PrismaJson=string|number|boolean|null|PrismaJson[]|{[key:string]:PrismaJson};
export const EditorialSchema = z.object({strings:z.record(z.string()),structures:z.record(JsonSchema)}).strict();
export const SiteSchema = z.object({routeSeo:z.record(z.object({title:z.string(),description:z.string()})),editorial:EditorialSchema,contact:z.object({whatsappNumber:z.string().regex(/^\d{8,15}$/),displayNumber:z.string(),email:z.string().email(),address:z.string(),hours:z.string()}),currencyRates:z.record(z.object({symbol:z.string(),rate:z.number().positive()})),guideCategories:z.array(z.object({title:z.string(),subtitle:z.string(),articles:z.array(z.object({slug:z.string(),title:z.string(),category:z.string(),readTime:z.string(),summary:z.string(),imageUrl:z.string(),featured:z.boolean().optional()}))}).strict()),featured:z.object({accommodationIds:z.array(z.string()),experienceIds:z.array(z.string()),packageIds:z.array(z.string())}),legacy:z.record(JsonSchema)}).strict();
export const SnapshotSchema = z.object({version:z.string(),accommodations:z.array(DetailedAccommodationSchema),experiences:z.array(ExperienceSchema),packages:z.array(DetailedPackageSchema),guides:z.array(GuideArticleSchema),albums:z.array(AlbumSchema),builderActivities:z.array(ActivityItemSchema),stayTiers:z.array(StayTierSchema),site:SiteSchema});
export type ContentSnapshot = z.infer<typeof SnapshotSchema>;
export function validatePayload(kind:string, payload:unknown) {
  const schema={accommodation:DetailedAccommodationSchema,experience:ExperienceSchema,package:DetailedPackageSchema,packageStay:PackageStaySchema,guide:GuideArticleSchema,album:AlbumSchema,site:SiteSchema,builderActivity:ActivityItemSchema,stayTier:StayTierSchema}[kind];
  if(!schema)throw new Error('Unknown content kind');
  return schema.parse(payload);
}
// Ensure varied guide blocks have the content required by their renderer.
export function validateGuideBlocks(guide: z.infer<typeof GuideArticleSchema>) {
  for(const section of guide.sections)for(const block of section.blocks){
    const required={text:'content',heading:'subheading',image:'imageUrl',callout:'callout',pullquote:'pullQuote',practical_info:'practicalPanel',bullet_list:'items',timeline:'timeline',table:'table',pricing_cards:'pricingCards'}[block.type];
    if(required&&!block[required])throw new Error('Incomplete guide block '+guide.slug+'/'+section.id+'/'+block.type);
  }
}
