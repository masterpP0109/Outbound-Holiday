import { z } from 'zod';
const text=(max:number)=>z.string().trim().max(max);
export const TripSchema=z.object({
  entryMode:z.enum(['quick','guided','custom']).optional(),
  promotionId:z.coerce.number().int().positive().optional(),
  promotionName:text(200).optional(),
  preferredContact:z.enum(['email','phone','whatsapp']).optional(),
  preferredReplyMethod:z.enum(['email','phone','whatsapp']).optional(),
  displayedEstimate:z.object({minimumUSD:z.number().nonnegative().max(10000000),maximumUSD:z.number().nonnegative().max(10000000),currency:z.literal('USD'),clientUnverified:z.literal(true)}).strict().optional(),
  itemizedEstimate:z.object({
    status:z.enum(['complete','partial','quote-only']),
    totalLabel:text(120),
    subtotalUSD:z.number().nonnegative().max(10000000).nullable(),
    excludedItems:z.array(text(200)).max(30),
    lines:z.array(z.object({
      section:text(40),
      title:text(200),
      basis:text(160),
      amountUSD:z.number().nonnegative().max(10000000).nullable(),
      status:z.enum(['estimated','confirmed','on_request','arranged','free'])
    }).strict()).max(40)
  }).strict().optional(),
  itineraryDraft:z.array(z.object({day:text(100),title:text(150),description:text(1000)}).strict()).max(31).optional(),
  intent:text(80).optional(),
  partyType:z.enum(['couple','family','friends','solo']).optional(),
  adults:z.number().int().min(1).max(100).optional(),
  children:z.number().int().min(0).max(100).optional(),
  childAges:z.array(text(60)).max(20).optional(),
  childAgeValues:z.array(z.number().int().min(0).max(17)).max(20).optional(),
  nights:z.number().int().min(1).max(90).optional(),
  timingMode:z.enum(['exact-dates','approx-month','flexible','undecided']).optional(),
  approxMonth:text(80).optional(),
  travelDates:text(250).optional(),
  arrivalDate:text(40).optional(),
  departureDate:text(40).optional(),
  visitorCategory:z.enum(['international','zimbabwe_resident','sadc_resident']).optional(),
  stayArrangement:z.enum(['selected','already-arranged','recommend','none']).optional(),
  stayTierId:text(100).optional(),
  stayTierName:text(150).optional(),
  stayNightRateUSD:z.number().nonnegative().max(10000000).optional(),
  requestedRooms:z.number().int().min(1).max(20).optional(),
  familyRoomRequested:z.boolean().optional(),
  roomId:text(120).optional(),
  roomType:text(200).optional(),
  ratePlanId:text(120).optional(),
  ratePlanName:text(200).optional(),
  mealPlanId:text(120).optional(),
  mealPlan:text(200).optional(),
  offerId:text(120).optional(),
  offerName:text(200).optional(),
  stayPreferences:z.array(text(150)).max(30).default([]),
  activityIds:z.array(text(100)).max(40).default([]),
  selectedActivities:z.array(z.object({
    id:text(100),
    title:text(200),
    duration:text(100).optional().default(''),
    unitPriceUSD:z.number().nonnegative().max(10000000).optional(),
    preferredDay:text(40).optional(),
    activityDate:text(40).optional(),
    preferredTime:text(60).optional(),
    priceBasis:text(60).optional(),
    rateStatus:z.enum(['provisional','confirmed','on_request']).optional()
  }).strict()).max(40).optional(),
  experienceIds:z.array(text(100)).max(40).default([]),
  preselectedExperienceTitle:text(200).optional(),
  accommodationId:text(100).optional(),
  accommodationName:text(200).optional(),
  accommodationCategory:text(120).optional(),
  packageId:text(100).optional(),
  packageTitle:text(200).optional(),
  transferArrangement:z.enum(['selected','already-arranged','recommend','none']).optional(),
  transferId:text(120).optional(),
  transferTitle:text(200).optional(),
  transferRoute:text(200).optional(),
  transferPriceUSD:z.number().nonnegative().max(10000000).optional(),
  transferBasis:text(60).optional(),
  transferDate:text(40).optional(),
  flightTime:text(40).optional(),
  flightTimeUnknown:z.boolean().optional(),
  pickupTime:text(40).optional(),
  transportType:z.enum(['private-transfers','shared-shuttle','self-drive','undecided','VIP-helicopter','none']).optional(),
  transportQuotedSeparately:z.boolean().optional()
}).strict();
export const SpamSchema={website:z.string().max(200).default(''),startedAt:z.number().int().positive(),turnstileToken:z.string().max(2048).optional()};
export const EnquirySchema=z.object({
  name:text(120).min(2),
  email:z.union([z.string().trim().email().max(254).transform(v=>v.toLowerCase()),z.literal('')]).optional().transform(v=>v||''),
  phone:text(60).optional(),
  message:text(5000).default(''),
  source:z.enum(['holiday-builder','contact']),
  promotionId:z.coerce.number().int().positive().optional(),
  promotionName:text(200).optional(),
  trip:TripSchema.default({}),
  marketingConsent:z.boolean().default(false),
  ...SpamSchema
}).strict().superRefine((v,ctx)=>{
  const phoneDigits=(v.phone??'').replace(/\D/g,'');
  const hasEmail=Boolean(v.email);
  const hasPhone=phoneDigits.length>=7;
  const preferredReply=v.trip.preferredReplyMethod??v.trip.preferredContact;
  if(!hasEmail&&!hasPhone){
    ctx.addIssue({code:z.ZodIssueCode.custom,path:['email'],message:'Please enter an email address or a valid WhatsApp/phone number.'});
  }
  if(preferredReply==='whatsapp'&&!hasPhone){
    ctx.addIssue({code:z.ZodIssueCode.custom,path:['phone'],message:'Please enter your WhatsApp number so our specialist can reply.'});
  }
  if(preferredReply==='email'&&!hasEmail){
    ctx.addIssue({code:z.ZodIssueCode.custom,path:['email'],message:'Please enter a valid email address for email replies.'});
  }
  if(v.source==='contact'&&v.message.length<5){
    ctx.addIssue({code:z.ZodIssueCode.custom,path:['message'],message:'Please enter a message of at least five characters.'});
  }
  if(v.source==='holiday-builder'&&v.trip.entryMode!=='quick'){
    const stayNeedsDetails=!v.trip.stayArrangement||v.trip.stayArrangement==='selected';
    const hasStayRef=Boolean(v.trip.stayTierId||v.trip.accommodationId);
    const hasNonStayItems=Boolean((v.trip.activityIds?.length??0)>0||(v.trip.experienceIds?.length??0)>0||v.trip.packageId||v.trip.transferId||v.trip.transferArrangement||v.trip.stayArrangement);
    if(stayNeedsDetails&&(!hasStayRef||!v.trip.nights||!v.trip.adults)){
      ctx.addIssue({code:z.ZodIssueCode.custom,path:['trip'],message:'Please complete the stay, nights, and guest details or mark stay as already arranged.'});
    }else if(!stayNeedsDetails&&!hasNonStayItems){
      ctx.addIssue({code:z.ZodIssueCode.custom,path:['trip'],message:'Please add at least one stay, activity, transfer, or note to your trip plan.'});
    }
  }
});
export const NewsletterSchema=z.object({email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),marketingConsent:z.literal(true),...SpamSchema}).strict();
export const IdempotencySchema=z.string().uuid();
export type EnquiryInput=z.infer<typeof EnquirySchema>;
