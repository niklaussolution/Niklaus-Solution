import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { AlertCircle, CheckCircle2, Star, Trash2 } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';

const REVIEWS_COLLECTION = 'Workshop Reviews';

interface Review {
  id: string;
  name?: string;
  role?: string;
  rating?: number;
  comment?: string;
  approved?: boolean;
  createdAt?: { seconds: number } | number | string;
}

function formatDate(value: Review['createdAt']) {
  if (!value) return '-';
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000).toLocaleString();
  }
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

export const WorkshopReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (err) {
      console.error(err);
      setError('Error fetching workshop reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalToggle = async (review: Review) => {
    try {
      setBusyId(review.id);
      setError('');
      await updateDoc(doc(db, REVIEWS_COLLECTION, review.id), { approved: !review.approved });
      setSuccess(review.approved ? 'Review unapproved' : 'Review approved');
      setTimeout(() => setSuccess(''), 3000);
      await fetchReviews();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to update review');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      setBusyId(id);
      setError('');
      await deleteDoc(doc(db, REVIEWS_COLLECTION, id));
      setSuccess('Review deleted');
      setTimeout(() => setSuccess(''), 3000);
      await fetchReviews();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to delete review');
    } finally {
      setBusyId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'approved') return r.approved === true;
    if (filter === 'pending') return !r.approved;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Workshop Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">
            Approve or reject attendee reviews before they go public ({reviews.length} total)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <div className="col-span-2 p-8 text-center text-gray-500 bg-white rounded-lg shadow">Loading...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-gray-500 bg-white rounded-lg shadow">
              No reviews found
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{review.name || 'Anonymous'}</div>
                    {review.role && <div className="text-xs text-gray-500">{review.role}</div>}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      review.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {review.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                {typeof review.rating === 'number' && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-700">{review.comment}</p>
                <div className="text-xs text-gray-400">{formatDate(review.createdAt)}</div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleApprovalToggle(review)}
                    disabled={busyId === review.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 ${
                      review.approved
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {review.approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={busyId === review.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
