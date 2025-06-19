
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, BookOpen, Sparkles, Globe, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const featuredStories = [
    {
      id: 1,
      title: "The Moonlight Princess",
      genre: "Fantasy",
      origin: "Japanese",
      language: "English",
      likes: 124,
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "The Clever Hare",
      genre: "Moral",
      origin: "African",
      language: "English",
      likes: 89,
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "The Magic Carpet",
      genre: "Adventure",
      origin: "Arabian",
      language: "English",
      likes: 156,
      cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    }
  ];

  const trendingGenres = ["Fantasy", "Adventure", "Romance", "Moral", "Comedy", "Mystery"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              StoryWhisper
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/library" className="text-gray-700 hover:text-purple-600 transition-colors">Library</Link>
            <Link to="/ai-stories" className="text-gray-700 hover:text-purple-600 transition-colors">AI Stories</Link>
            <Link to="/generator" className="text-gray-700 hover:text-purple-600 transition-colors">Generate</Link>
            <Link to="/publish" className="text-gray-700 hover:text-purple-600 transition-colors">Publish</Link>
          </nav>
          <Button variant="outline">Sign In</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Discover Magical
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Fairytales
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Immerse yourself in a world of enchanting stories from every corner of the globe. 
            Read, listen, and create magical tales with AI-powered narration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              <BookOpen className="w-5 h-5 mr-2" />
              Start Reading
            </Button>
            <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3">
              <Sparkles className="w-5 h-5 mr-2" />
              Try AI Fairytale
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Stories</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStories.map((story) => (
            <Card key={story.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={story.cover} 
                  alt={story.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90">
                    <Globe className="w-3 h-3 mr-1" />
                    {story.origin}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                  {story.title}
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <Badge variant="outline">{story.genre}</Badge>
                  <span className="text-sm text-gray-500">{story.language}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Read
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-1" />
                      Listen
                    </Button>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Heart className="w-4 h-4 mr-1" />
                    <span className="text-sm">{story.likes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending Genres */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-2xl mx-4 mb-16">
        <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Trending Genres</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {trendingGenres.map((genre) => (
            <Badge 
              key={genre} 
              variant="secondary" 
              className="px-4 py-2 text-sm hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-colors"
            >
              {genre}
            </Badge>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-purple-600">1,200+</div>
            <div className="text-gray-600">Stories Available</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-blue-600">50+</div>
            <div className="text-gray-600">Languages Supported</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-green-600">10K+</div>
            <div className="text-gray-600">Happy Readers</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-xl font-bold">StoryWhisper</span>
              </div>
              <p className="text-gray-400">
                Bringing magical stories to life with AI-powered narration and global fairytale collections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/library" className="hover:text-white transition-colors">Story Library</Link></li>
                <li><Link to="/ai-stories" className="hover:text-white transition-colors">AI Stories</Link></li>
                <li><Link to="/recommendations" className="hover:text-white transition-colors">Recommendations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Create</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/generator" className="hover:text-white transition-colors">AI Generator</Link></li>
                <li><Link to="/publish" className="hover:text-white transition-colors">Publish Story</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Settings</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StoryWhisper. Crafted with magic and technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
