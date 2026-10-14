import { enquiryDateLabel } from '../../../shared/enquiry-confirmation';

export function EnquiryConfirmation({ result }: { result: { reference?: string; customerName?: string; submittedAt?: string } | null }) {
  const date = enquiryDateLabel(result?.submittedAt, result?.reference);
  return <dl className="mx-auto my-4 max-w-md rounded-xl border border-[#dce4d7] bg-[#f3f5ef] p-4 text-left text-sm text-[#263b33]" role="status">
    <dt className="text-xs font-bold">Reference</dt>
    <dd className="mb-3 break-all font-semibold">{result?.reference}</dd>
    {result?.customerName && <><dt className="text-xs font-bold">Customer</dt><dd className="mb-3">{result.customerName}</dd></>}
    {date && <><dt className="text-xs font-bold">Date submitted</dt><dd>{date}</dd></>}
  </dl>;
}
