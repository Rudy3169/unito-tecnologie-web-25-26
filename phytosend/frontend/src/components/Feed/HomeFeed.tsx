import { useState } from 'react';
import { PostList } from './PostList';
import { CreatePostForm } from './CreatePostForm';
import type { PostProps } from './PostCard';

// Stato Iniziale MOCK
const MOCK_POSTS: PostProps[] = [
    {
        id: 1,
        username: "EcoGianni",
        location: "Parco Nazionale del Gran Paradiso",
        imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?auto=format&fit=crop&q=80&w=800",
        caption: "Una passeggiata incredibile nei boschi 🌳💚",
        likesCount: 142,
        isLikedByMe: false
    }
];

export function HomeFeed() {
    const [posts, setPosts] = useState<PostProps[]>(MOCK_POSTS);

    const handleAddPost = (newPost: PostProps) => {
        setPosts([newPost, ...posts]);
    };

    // --- LA NUOVA MAGIA DEL LIKE ---
    const handleToggleLike = (postId: number) => {
        // Troviamo il post giusto e modifichiamo i suoi numeretti
        const nuoviPost = posts.map(post => {
            if (post.id === postId) {
                // Se aveva già like lo togliamo, altrimenti lo mettiamo!
                const isOraLiked = !post.isLikedByMe;
                return {
                    ...post,
                    isLikedByMe: isOraLiked,
                    likesCount: isOraLiked ? post.likesCount + 1 : post.likesCount - 1
                };
            }
            return post;
        });

        // Salviamo lo stato "virtuale" (in futuro qui ci sarà una fetch() verso il Backend Java String Boot)
        setPosts(nuoviPost);
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <CreatePostForm onPostCreated={handleAddPost} />

            {/* Passiamo la funzione onToggleLike alla lista! */}
            <PostList posts={posts} onToggleLike={handleToggleLike} />
        </div>
    );
}

