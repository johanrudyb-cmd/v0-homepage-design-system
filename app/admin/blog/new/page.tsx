import { BlogPostForm } from '@/components/blog/BlogPostForm';

export const metadata = {
    title: 'Nouvel article | Admin Blog',
};

export default function NewBlogPostPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] p-6 pb-20">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#1D1D1F] mb-8">Rédiger un nouvel article</h1>
                <BlogPostForm />
            </div>
        </div>
    );
}
