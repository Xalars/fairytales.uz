
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Play, BookOpen, Search, Filter, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");

  const stories = [
    {
      id: 1,
      title: "The Moonlight Princess",
      genre: "Fantasy",
      origin: "Japanese",
      language: "English",
      likes: 124,
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      description: "A beautiful tale of a princess born from moonbeams who must save her kingdom from eternal darkness."
    },
    {
      id: 2,
      title: "The Clever Hare",
      genre: "Moral",
      origin: "African",
      language: "English",
      likes: 89,
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
      description: "A wise hare outsmarts the other forest animals through cleverness and wit."
    },
    {
      id: 3,
      title: "The Magic Carpet",
      genre: "Adventure",
      origin: "Arabian",
      language: "English",
      likes: 156,
      cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      description: "Join a young merchant on his magical flying carpet as he travels across mystical lands."
    },
    {
      id: 4,
      title: "The Snow Queen",
      genre: "Fantasy",
      origin: "Nordic",
      language: "English",
      likes: 203,
      cover: "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=400&h=300&fit=crop",
      description: "A tale of friendship and courage in the face of an icy queen's spell."
    },
    {
      id: 5,
      title: "The Dancing Bear",
      genre: "Comedy",
      origin: "Russian",
      language: "English",
      likes: 67,
      cover: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop",
      description: "A humorous story about a bear who discovers his love for dancing."
    },
    {
      id: 6,
      title: "The Golden Fish",
      genre: "Moral",
      origin: "Uzbek",
      language: "English",
      likes: 78,
      cover: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300&fit=crop",
      description: "A fisherman's encounter with a magical golden fish teaches valuable lessons about greed."
    }
  ];

  const genres = ["All", "Fantasy", "Adventure", "Romance", "Moral", "Comedy", "Mystery"];
  const languages = ["All", "English", "Uzbek", "Russian", "Spanish", "French", "German"];
  const origins = ["All", "Japanese", "African", "Arabian", "Nordic", "Russian", "Uzbek", "European"];

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || story.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesLanguage = selectedLanguage === "all" || story.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesOrigin = selectedOrigin === "all" || story.origin.toLowerCase() === selectedOrigin.toLowerCase();
    
    return matchesSearch && matchesGenre && matchesLanguage && matchesOrigin;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              StoryWhisper
            </h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/library" className="text-purple-600 font-medium">Library</Link>
            <Link to="/ai-stories" className="text-gray-700 hover:text-purple-600 transition-colors">AI Stories</Link>
            <Link to="/generator" className="text-gray-700 hover:text-purple-600 transition-colors">Generate</Link>
            <Link to="/publish" className="text-gray-700 hover:text-purple-600 transition-colors">Publish</Link>
          </nav>
          <Button variant="outline">Sign In</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Genre</label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language} value={language.toLowerCase()}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Origin</label>
                  <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {origins.map((origin) => (
                        <SelectItem key={origin} value={origin.toLowerCase()}>
                          {origin}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedGenre("all");
                    setSelectedLanguage("all");
                    setSelectedOrigin("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Story Library</h2>
              <p className="text-gray-600">
                Showing {filteredStories.length} of {stories.length} stories
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
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
                    <CardDescription className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{story.genre}</Badge>
                      <span className="text-sm text-gray-500">{story.language}</span>
                    </CardDescription>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {story.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Link to={`/story/${story.id}`}>
                          <Button size="sm" variant="outline">
                            <BookOpen className="w-4 h-4 mr-1" />
                            Read
                          </Button>
                        </Link>
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

            {filteredStories.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No stories found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
